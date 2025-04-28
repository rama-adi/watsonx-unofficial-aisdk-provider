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
    postJsonToApi, generateId
} from "@ai-sdk/provider-utils";
import {z} from "zod";
import {
    watsonxFailedResponseHandler
} from "../../types/watsonx-response-schema.ts";
import {getResponseMetadata} from "../../utils/get-response-metadata.ts";
import type {
    WatsonxCompletionConfig,
    WatsonxCompletionModelId,
    WatsonxCompletionSetting
} from "./watsonx-completion-model-settings.ts";
import {convertToWatsonxCompatibleCompletionPrompt} from "./convert-to-watsonx-chat-completion.ts";
import {watsonxCompletionChunkSchema, watsonxCompletionResponseSchema} from "./watsonx-completion-schema.ts";
import {mapWatsonxCompletionFinishReason} from "./watsonx-completion-finish-reason.ts";

export class WatsonxCompletionModel implements LanguageModelV1 {
    readonly specificationVersion = "v1";
    readonly defaultObjectGenerationMode = undefined;
    readonly supportsImageUrls = false;

    readonly modelId: WatsonxCompletionModelId;
    readonly settings: WatsonxCompletionSetting;
    private readonly config: WatsonxCompletionConfig;

    constructor(
        modelId: WatsonxCompletionModelId,
        settings: WatsonxCompletionSetting,
        config: WatsonxCompletionConfig
    ) {
        this.modelId = modelId;
        this.settings = settings;
        this.config = config;
    }

    get provider(): string {
        return this.config.provider;
    }

    private getArgs(
        options: Parameters<LanguageModelV1['doGenerate']>[0]
    ): { args: any; warnings: LanguageModelV1CallWarning[] } {
        const {
            mode,
            inputFormat,
            prompt,
            maxTokens,
            temperature,
            topP,
            topK,
            frequencyPenalty,
            presencePenalty,
            stopSequences: userStopSequences,
            responseFormat,
            seed,
            providerMetadata,
        } = options;

        const type = mode.type;
        const warnings: LanguageModelV1CallWarning[] = [];


        if (responseFormat != null && responseFormat.type !== 'text') {
            warnings.push({
                type: 'unsupported-setting',
                setting: 'responseFormat',
                details: 'JSON response format is not supported.',
            });
        }

        const {prompt: completionPrompt, stopSequences} = convertToWatsonxCompatibleCompletionPrompt({
            prompt,
            inputFormat
        });

        const stop = [...(stopSequences ?? []), ...(userStopSequences ?? [])];

        // Reconstruct body to map with what watsonx expects
        const baseArgs: any = {
            temperature,
            model_id: this.modelId,
            project_id: this.config.projectID,
            input: completionPrompt,
            parameters: {
                frequency_penalty: frequencyPenalty,
                max_new_tokens: maxTokens,
                presence_penalty: presencePenalty,
                top_p: topP,
                random_seed: seed,
                top_k: topK,
                time_limit: providerMetadata?.watsonx?.timeLimit,
                stop_sequences: stop,
                decoding_method: this.settings.decodingMethod ?? "greedy",
                ...(this.settings.textgenLengthPenalty !== undefined ? {
                    length_penalty: {
                        decay_factor: this.settings.textgenLengthPenalty.decayFactor,
                        start_index: this.settings.textgenLengthPenalty.startIndex
                    }
                } : {}),
            },
            return_options: {
                input_text: this.settings.returnOptions?.inputText ?? false,
                generated_tokens: this.settings.returnOptions?.generatedTokens ?? false
            }
        };

        switch (type) {
            case 'regular': {
                if (mode.tools?.length) {
                    throw new UnsupportedFunctionalityError({
                        functionality: 'tools',
                    });
                }

                if (mode.toolChoice) {
                    throw new UnsupportedFunctionalityError({
                        functionality: 'toolChoice',
                    });
                }

                return {args: baseArgs, warnings};
            }

            case 'object-json': {
                throw new UnsupportedFunctionalityError({
                    functionality: 'object-json mode',
                });
            }

            case 'object-tool': {
                throw new UnsupportedFunctionalityError({
                    functionality: 'object-tool mode',
                });
            }

            default:
                throw new Error(`Unsupported mode type: ${(mode as any).type}`);
        }
    }

    async doGenerate(
        options: Parameters<LanguageModelV1['doGenerate']>[0]
    ): Promise<Awaited<ReturnType<LanguageModelV1['doGenerate']>>> {
        const {args, warnings} = this.getArgs(options);

        const {
            responseHeaders,
            value: response,
            rawValue: rawResponse,
        } = await postJsonToApi({
            url: `${this.config.clusterURL}/text/generation?version=${this.config.version}`,
            headers: combineHeaders(this.config.headers(), options.headers),
            body: args,
            failedResponseHandler: watsonxFailedResponseHandler,
            successfulResponseHandler: createJsonResponseHandler(
                watsonxCompletionResponseSchema
            ),
            abortSignal: options.abortSignal,
            fetch: this.config.fetch
        });

        const {messages: rawPrompt, ...rawSettings} = args;
        const choice = response.results[0];

        if (!choice) {
            throw new Error('No choice in response');
        }

        return {
            text: choice.generated_text,
            usage: {
                promptTokens: response.usage?.prompt_tokens ?? NaN,
                completionTokens: response.usage?.completion_tokens ?? NaN,
            },
            finishReason: mapWatsonxCompletionFinishReason(choice.stop_reason),
            rawCall: {rawPrompt, rawSettings},
            rawResponse: {headers: responseHeaders, body: rawResponse},
            response: {
                id: generateId(),
                timestamp: new Date(response.created_at),
                modelId: response.model_id,
            },
            warnings,
            request: {body: JSON.stringify(args)},
        };

    }

    async doStream(
        options: Parameters<LanguageModelV1['doStream']>[0],
    ): Promise<Awaited<ReturnType<LanguageModelV1['doStream']>>> {

        const url = `${this.config.clusterURL}/text/generation_stream?version=${this.config.version}`;

        const {args, warnings} = this.getArgs(options);

        const body = {
            ...args,
            stream: true,
        };

        const {value: response, responseHeaders} = await postJsonToApi({
            url,
            headers: combineHeaders(this.config.headers(), options.headers),
            body,
            failedResponseHandler: watsonxFailedResponseHandler,
            successfulResponseHandler: createEventSourceResponseHandler(
                watsonxCompletionChunkSchema,
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
        let isFirstChunk = true;


        return {
            stream: response.pipeThrough(
                new TransformStream<
                    ParseResult<z.infer<typeof watsonxCompletionChunkSchema>>,
                    LanguageModelV1StreamPart
                >({
                    transform(chunk, controller) {
                        // handle failed chunk parsing / validation:
                        if (!chunk.success) {
                            finishReason = 'error';
                            controller.enqueue({type: 'error', error: chunk.error});
                            return;
                        }

                        const value = chunk.value;

                        // handle error chunks:
                        if ('error' in value) {
                            finishReason = 'error';
                            controller.enqueue({type: 'error', error: value.error});
                            return;
                        }

                        if (isFirstChunk) {
                            isFirstChunk = false;
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

                        const choice = value.results[0];

                        if (choice?.stop_reason != null) {
                            finishReason = mapWatsonxCompletionFinishReason(
                                choice.stop_reason,
                            );
                        }

                        if (choice?.generated_text != null) {
                            controller.enqueue({
                                type: 'text-delta',
                                textDelta: choice.generated_text,
                            });
                        }
                    },

                    flush(controller) {
                        controller.enqueue({
                            type: 'finish',
                            finishReason,
                            usage,
                        });
                    },
                }),
            ),
            rawCall: {rawPrompt, rawSettings},
            rawResponse: {headers: responseHeaders},
            warnings,
            request: {body: JSON.stringify(body)},
        };
    }
}
