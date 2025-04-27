import {
    UnsupportedFunctionalityError,
    type LanguageModelV1,
    type LanguageModelV1CallWarning,
    type LanguageModelV1FinishReason,
    type LanguageModelV1StreamPart
} from "@ai-sdk/provider";
import {
    type ParseResult,
    combineHeaders,
    createEventSourceResponseHandler,
    createJsonResponseHandler,
    postJsonToApi
} from "@ai-sdk/provider-utils";
import {z} from "zod";
import {mapWatsonxFinishReason} from "../../utils/watsonx-finish-reason.ts";
import {prepareTools} from "../../utils/watsonx-prepare-tools.ts";
import {convertToWatsonxChatMessages} from "./convert-to-watsonx-chat-messages.ts";
import {
    watsonxChatChunkSchema,
    watsonxChatResponseSchema,
    watsonxFailedResponseHandler
} from "../../types/watsonx-response-schema.ts";
import {getResponseMetadata} from "../../utils/get-response-metadata.ts";
import {
    functionCallingModels,
    type WatsonxChatConfig,
    type WatsonxChatModelId,
    type WatsonxChatSetting
} from "./watsonx-chat-language-model-settings.ts";

export class WatsonxChatLanguageModel implements LanguageModelV1 {
    readonly specificationVersion = "v1";
    readonly defaultObjectGenerationMode = "tool";
    readonly supportsImageUrls = false;

    readonly modelId: WatsonxChatModelId;
    readonly settings: WatsonxChatSetting;
    private readonly config: WatsonxChatConfig;

    constructor(
        modelId: WatsonxChatModelId,
        settings: WatsonxChatSetting,
        config: WatsonxChatConfig
    ) {
        this.modelId = modelId;
        this.settings = settings;
        this.config = config;
    }

    get provider(): string {
        return this.config.provider;
    }

    private sanityCheck(options: Parameters<LanguageModelV1['doGenerate']>[0]) {

        if (options.mode.type === 'regular' && options.mode.tools?.length && !functionCallingModels.includes(this.modelId as any)) {
            throw new UnsupportedFunctionalityError({
                functionality: "Tool calling",
                message: `The model ${this.modelId} does not support tool calling`
            });
        }

        if (options.mode.type === 'object-tool' && !functionCallingModels.includes(this.modelId as any)) {
            throw new UnsupportedFunctionalityError({
                functionality: "Tool calling",
                message: `The model ${this.modelId} does not support tool calling`
            });
        }
    }

    private getArgs(
        options: Parameters<LanguageModelV1['doGenerate']>[0]
    ): { args: any; warnings: LanguageModelV1CallWarning[] } {
        const {
            mode,
            prompt,
            maxTokens,
            temperature,
            topP,
            topK,
            frequencyPenalty,
            presencePenalty,
            stopSequences,
            responseFormat,
            seed,
            providerMetadata,
        } = options;

        const type = mode.type;
        const warnings: LanguageModelV1CallWarning[] = [];

        // checks for unsupported params
        if (topK !== null) warnings.push({
            type: 'unsupported-setting',
            setting: 'topK',
        });

        if (stopSequences !== null) warnings.push({
            type: 'unsupported-setting',
            setting: 'stopSequences',
        });


        // Reconstruct body to map with what watsonx expects
        const baseArgs: any = {
            temperature,
            model_id: this.modelId,
            project_id: this.config.projectID,
            prompt: prompt,
            frequency_penalty: frequencyPenalty,
            max_tokens: maxTokens,
            presence_penalty: presencePenalty,
            top_p: topP,
            response_format: responseFormat?.type === 'json' ? {type: 'json_object'} : undefined,
            seed,
            messages: convertToWatsonxChatMessages(prompt),
            time_limit: providerMetadata?.watsonx?.timeLimit
        };

        switch (type) {
            case 'regular': {
                const {tools, tool_choice, toolWarnings} = prepareTools(mode);
                return {
                    args: {...baseArgs, tools, tool_choice},
                    warnings: [...warnings, ...toolWarnings],
                };
            }

            case 'object-json': {
                return {
                    args: {
                        ...baseArgs,
                        response_format: {type: 'json_object'},
                    },
                    warnings,
                };
            }

            case 'object-tool': {
                return {
                    args: {
                        ...baseArgs,
                        tools: [
                            {type: 'function', function: mode.tool}
                        ],
                    },
                    warnings,
                };
            }

            default:
                throw new Error(`Unsupported mode type: ${(mode as any).type}`);
        }
    }

    async doGenerate(
        options: Parameters<LanguageModelV1['doGenerate']>[0]
    ): Promise<Awaited<ReturnType<LanguageModelV1['doGenerate']>>> {
        this.sanityCheck(options);
        const {args, warnings} = this.getArgs(options);

        const {
            responseHeaders,
            value: response,
            rawValue: rawResponse,
        } = await postJsonToApi({
            url: `${this.config.clusterURL}/text/chat?version=${this.config.version}`,
            headers: combineHeaders(this.config.headers(), options.headers),
            body: args,
            failedResponseHandler: watsonxFailedResponseHandler,
            successfulResponseHandler: createJsonResponseHandler(
                watsonxChatResponseSchema
            ),
            abortSignal: options.abortSignal,
            fetch: this.config.fetch
        });

        const {messages: rawPrompt, ...rawSettings} = args;
        const choice = response.choices[0];

        if (!choice) {
            throw new Error('No choice in response');
        }

        return {
            text: choice.message.content ?? "",
            toolCalls: choice.message.tool_calls?.map(toolCall => ({
                toolCallType: 'function',
                toolCallId: toolCall.id,
                toolName: toolCall.function.name,
                args: toolCall.function.arguments
            })),
            finishReason: mapWatsonxFinishReason(choice.finish_reason),
            usage: {promptTokens: response.usage.prompt_tokens, completionTokens: response.usage.completion_tokens},
            rawCall: {rawPrompt, rawSettings},
            rawResponse: {
                headers: responseHeaders,
                body: rawResponse,
            },
            request: {
                body: JSON.stringify(args)
            },
            response: getResponseMetadata(response),
            warnings,
        }

    }

    async doStream(
        options: Parameters<LanguageModelV1['doStream']>[0],
    ): Promise<Awaited<ReturnType<LanguageModelV1['doStream']>>> {
        this.sanityCheck(options);
        const {args, warnings} = this.getArgs(options);
        const url = `${this.config.clusterURL}/text/chat_stream?version=${this.config.version}`;

        const body = {...args, stream: true};

        const {value: response, responseHeaders} = await postJsonToApi({
            url,
            headers: combineHeaders(this.config.headers(), options.headers),
            body,
            failedResponseHandler: watsonxFailedResponseHandler,
            successfulResponseHandler: createEventSourceResponseHandler(
                watsonxChatChunkSchema,
            ),
            abortSignal: options.abortSignal,
            fetch: this.config.fetch
        });

        const {messages: rawPrompt, ...rawSettings} = args;

        let finishReason: LanguageModelV1FinishReason = 'unknown';
        let usage: { promptTokens: number; completionTokens: number } = {
            promptTokens: Number.NaN,
            completionTokens: Number.NaN,
        };
        let chunkNumber = 0;
        let trimLeadingSpace = false;


        return {
            stream: response.pipeThrough(
                new TransformStream<
                    ParseResult<z.infer<typeof watsonxChatChunkSchema>>,
                    LanguageModelV1StreamPart
                >({
                    transform(chunk, controller) {

                        if (!chunk.success) {
                            controller.enqueue({type: 'error', error: chunk.error});
                            return;
                        }

                        chunkNumber++;

                        const value = chunk.value;

                        if (chunkNumber === 1) {
                            controller.enqueue({
                                type: 'response-metadata',
                                ...getResponseMetadata(value),
                            });
                        }

                        if (value.usage != null) {
                            usage = {
                                promptTokens: value.usage.prompt_tokens,
                                completionTokens: value.usage.completion_tokens,
                            };
                        }

                        const choice = value.choices[0];
                        if (!choice) {
                            return;
                        }

                        if (choice?.finish_reason != null) {
                            finishReason = mapWatsonxFinishReason(choice.finish_reason);
                        }

                        if (choice?.delta == null) {
                            return;
                        }

                        const delta = choice.delta;

                        // extract text content.
                        // image content or reference content is currently ignored.
                        const textContent = delta.content ?? "";


                        // when there is a trailing assistant message, watsonx will send the
                        // content of that message again. we skip this repeated content to
                        // avoid duplication, e.g. in continuation mode.
                        if (chunkNumber <= 2) {
                            const lastMessage = rawPrompt[rawPrompt.length - 1];

                            if (
                                lastMessage.role === 'assistant' &&
                                textContent === lastMessage.content.trimEnd()
                            ) {
                                // watsonx moves the trailing space from the prefix to the next chunk.
                                // We trim the leading space to avoid duplication.
                                if (textContent.length < lastMessage.content.length) {
                                    trimLeadingSpace = true;
                                }

                                // skip the repeated content:
                                return;
                            }
                        }

                        if (textContent != null && textContent !== "") {
                            controller.enqueue({
                                type: 'text-delta',
                                textDelta: trimLeadingSpace
                                    ? textContent.trimStart()
                                    : textContent,
                            });

                            trimLeadingSpace = false;
                        }

                        if (delta.tool_calls != null) {
                            for (const toolCall of delta.tool_calls) {
                                // Generate a temporary ID if none is provided
                                const toolCallId = toolCall.id ?? `temp-${chunkNumber}-${toolCall.index ?? 0}`;

                                // watsonx tool calls come in one piece:
                                controller.enqueue({
                                    type: 'tool-call-delta',
                                    toolCallType: 'function',
                                    toolCallId,
                                    toolName: toolCall.function.name,
                                    argsTextDelta: toolCall.function.arguments,
                                });

                                controller.enqueue({
                                    type: 'tool-call',
                                    toolCallType: 'function',
                                    toolCallId,
                                    toolName: toolCall.function.name,
                                    args: toolCall.function.arguments,
                                });
                            }
                        }
                    },

                    flush(controller) {
                        controller.enqueue({type: 'finish', finishReason, usage});
                    },
                }),
            ),
            rawCall: {rawPrompt, rawSettings},
            rawResponse: {headers: responseHeaders},
            request: {body: JSON.stringify(body)},
            warnings,
        };
    }
}
