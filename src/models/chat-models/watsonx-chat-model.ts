import {
  UnsupportedFunctionalityError,
  InvalidResponseDataError,
  type LanguageModelV2,
  type LanguageModelV2CallOptions,
  type LanguageModelV2CallWarning,
  type LanguageModelV2Content,
  type LanguageModelV2FinishReason,
  type LanguageModelV2ResponseMetadata,
  type LanguageModelV2StreamPart,
  type LanguageModelV2Usage,
  type SharedV2Headers,
} from '@ai-sdk/provider';
import {
  type ParseResult,
  combineHeaders,
  createEventSourceResponseHandler,
  createJsonResponseHandler,
  generateId,
  isParsableJson,
  postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod/v4';
import { mapWatsonxChatFinishReason } from './watsonx-chat-finish-reason.ts';
import { convertToWatsonxChatMessages } from './convert-to-watsonx-chat-messages.ts';
import { watsonxFailedResponseHandler } from '../../types/watsonx-response-schema.ts';
import {
  FunctionCallingModelLists,
  type WatsonxChatConfig,
  type WatsonxChatModelId,
  type WatsonxChatSetting,
} from './watsonx-chat-model-settings.ts';
import {
  watsonxChatChunkSchema,
  watsonxChatResponseSchema,
} from './watsonx-chat-schema.ts';

export class WatsonxChatModel implements LanguageModelV2 {
  readonly specificationVersion = 'v2' as const;
  readonly provider: string;
  readonly defaultObjectGenerationMode = 'tool' as const;
  readonly supportsImageUrls = false;
  readonly supportedUrls: Record<string, RegExp[]> = {};

  readonly modelId: WatsonxChatModelId;
  readonly settings: WatsonxChatSetting;
  private readonly config: WatsonxChatConfig;

  constructor(
    modelId: WatsonxChatModelId,
    settings: WatsonxChatSetting,
    config: WatsonxChatConfig,
  ) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
    this.provider = config.provider;
  }

  private sanityCheck(options: LanguageModelV2CallOptions) {
    if (
      options.tools?.length &&
      !FunctionCallingModelLists.includes(this.modelId as any)
    ) {
      throw new UnsupportedFunctionalityError({
        functionality: 'Tool calling',
        message: `The model ${this.modelId} does not support tool calling`,
      });
    }
  }

  private getArgs({
    prompt,
    maxOutputTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences,
    responseFormat,
    seed,
    tools,
    toolChoice,
    providerOptions,
  }: LanguageModelV2CallOptions) {
    const warnings: LanguageModelV2CallWarning[] = [];

    // checks for unsupported params
    if (topK != null) {
      warnings.push({
        type: 'unsupported-setting',
        setting: 'topK',
      });
    }

    // map framework stopSequences to API 'stop'

    const baseArgs = {
      temperature,
      model_id: this.modelId,
      project_id: this.config.projectID,
      frequency_penalty: frequencyPenalty,
      // IBM watsonx prefers max_completion_tokens; max_tokens is deprecated
      ...(maxOutputTokens != null
        ? { max_completion_tokens: maxOutputTokens }
        : {}),
      presence_penalty: presencePenalty,
      top_p: topP,
      seed,
      messages: convertToWatsonxChatMessages(prompt),
      time_limit: providerOptions?.watsonx?.timeLimit,
      // OpenAPI optional parameters supported via providerOptions.watsonx
      ...(providerOptions?.watsonx?.maxCompletionTokens != null
        ? { max_completion_tokens: providerOptions.watsonx.maxCompletionTokens }
        : {}),
      ...(providerOptions?.watsonx?.logprobs != null
        ? { logprobs: providerOptions.watsonx.logprobs }
        : {}),
      ...(providerOptions?.watsonx?.topLogprobs != null
        ? { top_logprobs: providerOptions.watsonx.topLogprobs }
        : {}),
      ...(providerOptions?.watsonx?.logitBias != null
        ? { logit_bias: providerOptions.watsonx.logitBias }
        : {}),
      ...(providerOptions?.watsonx?.n != null
        ? { n: providerOptions.watsonx.n }
        : {}),
      ...(providerOptions?.watsonx?.spaceId != null
        ? { space_id: providerOptions.watsonx.spaceId }
        : {}),
      ...(stopSequences != null ? { stop: stopSequences } : {}),
    };

    if (responseFormat?.type === 'json') {
      return {
        args: {
          ...baseArgs,
          response_format: { type: 'json_object' },
        },
        warnings,
      };
    }

    if (tools && tools.length > 0) {
      const mappedTools = tools
        .filter((tool) => tool.type === 'function')
        .map((tool) => ({
          type: 'function' as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          },
        }));

      let tool_choice_option: 'auto' | undefined = undefined;
      let tool_choice:
        | { type: 'function'; function: { name: string } }
        | undefined = undefined;

      if (toolChoice?.type === 'tool') {
        tool_choice = {
          type: 'function',
          function: {
            name: toolChoice.toolName,
          },
        };
      } else if (
        toolChoice?.type === 'auto' ||
        toolChoice?.type === 'required'
      ) {
        tool_choice_option = 'auto';
      }

      return {
        args: {
          ...baseArgs,
          tools: mappedTools,
          tool_choice_option,
          tool_choice,
        },
        warnings,
      };
    }

    return {
      args: baseArgs,
      warnings,
    };
  }

  async doGenerate(options: LanguageModelV2CallOptions): Promise<{
    content: Array<LanguageModelV2Content>;
    finishReason: LanguageModelV2FinishReason;
    usage: LanguageModelV2Usage;
    warnings: Array<LanguageModelV2CallWarning>;
    request?: { body?: unknown };
    response?: LanguageModelV2ResponseMetadata & {
      headers?: SharedV2Headers;
      body?: unknown;
    };
  }> {
    this.sanityCheck(options);
    const { args, warnings } = this.getArgs(options);

    const { value: response, responseHeaders } = await postJsonToApi({
      url: `${this.config.clusterURL}/text/chat?version=${this.config.version}`,
      headers: combineHeaders(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: watsonxFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        watsonxChatResponseSchema,
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch,
    });

    const choice = response.choices[0];

    if (!choice) {
      throw new Error('No choice in response');
    }

    const content: Array<LanguageModelV2Content> = [];

    if (choice.message.content) {
      content.push({
        type: 'text' as const,
        text: choice.message.content,
      });
    }

    if (choice.message.tool_calls) {
      for (const toolCall of choice.message.tool_calls) {
        content.push({
          type: 'tool-call' as const,
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          input: toolCall.function.arguments,
        });
      }
    }

    return {
      content,
      finishReason: mapWatsonxChatFinishReason(choice.finish_reason),
      usage: {
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      },
      warnings,
      request: { body: args },
      response: {
        id: response.id,
        modelId: response.model_id,
        headers: responseHeaders,
      },
    };
  }

  async doStream(options: LanguageModelV2CallOptions): Promise<{
    stream: ReadableStream<LanguageModelV2StreamPart>;
    warnings: Array<LanguageModelV2CallWarning>;
    request?: { body?: unknown };
    response?: LanguageModelV2ResponseMetadata & {
      headers?: SharedV2Headers;
      body?: unknown;
    };
  }> {
    this.sanityCheck(options);
    const { args, warnings } = this.getArgs(options);
    const url = `${this.config.clusterURL}/text/chat_stream?version=${this.config.version}`;

    const body = { ...args };

    const { value: response, responseHeaders } = await postJsonToApi({
      url,
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: watsonxFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        watsonxChatChunkSchema,
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch,
    });

    const toolCalls: Array<{
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string;
      };
      inputStarted: boolean;
      sent: boolean;
    }> = [];

    let finishReason: LanguageModelV2FinishReason = 'other';
    const usage: LanguageModelV2Usage = {
      inputTokens: Number.NaN,
      outputTokens: Number.NaN,
      totalTokens: Number.NaN,
    };

    let chunkNumber = 0;
    let textStarted = false;
    let textId: string | undefined;
    let watsonxResponseId: string | undefined;
    let trimLeadingSpace = false;

    return {
      stream: response.pipeThrough(
        new TransformStream<
          ParseResult<z.infer<typeof watsonxChatChunkSchema>>,
          LanguageModelV2StreamPart
        >({
          transform(chunk, controller) {
            if (!chunk.success) {
              finishReason = 'error';
              controller.enqueue({ type: 'error', error: chunk.error });
              return;
            }

            chunkNumber++;
            const value = chunk.value;

            if (value.id) {
              watsonxResponseId = value.id;
              controller.enqueue({
                type: 'response-metadata',
                id: value.id,
              });
            }

            if (value.model_id) {
              controller.enqueue({
                type: 'response-metadata',
                modelId: value.model_id,
              });
            }

            if (value.usage != null) {
              usage.inputTokens = value.usage.prompt_tokens;
              usage.outputTokens = value.usage.completion_tokens;
              usage.totalTokens = value.usage.total_tokens;
            }

            const choice = value.choices[0];
            if (!choice) {
              return;
            }

            if (choice?.finish_reason != null) {
              finishReason = mapWatsonxChatFinishReason(choice.finish_reason);
            }

            if (choice?.delta == null) {
              return;
            }

            const delta = choice.delta;
            const textContent = delta.content ?? '';

            // when there is a trailing assistant message, watsonx will send the
            // content of that message again. we skip this repeated content to
            // avoid duplication, e.g. in continuation mode.
            if (chunkNumber <= 2) {
              const messages = convertToWatsonxChatMessages(options.prompt);
              const lastMessage = messages[messages.length - 1];

              if (
                lastMessage?.role === 'assistant' &&
                lastMessage.content &&
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

            if (textContent != null && textContent !== '') {
              if (!textStarted) {
                textId = watsonxResponseId || generateId();
                controller.enqueue({
                  type: 'text-start',
                  id: textId,
                });
                textStarted = true;
              }

              controller.enqueue({
                type: 'text-delta',
                delta: trimLeadingSpace ? textContent.trimStart() : textContent,
                id: textId || generateId(),
              });

              trimLeadingSpace = false;
            }

            if (delta.tool_calls != null) {
              for (const toolCallDelta of delta.tool_calls) {
                const index = toolCallDelta.index ?? toolCalls.length - 1;

                // Tool call start. WatsonX returns all information except the arguments in the first chunk.
                if (toolCalls[index] == null) {
                  if (toolCallDelta.type !== 'function') {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function' type.`,
                    });
                  }

                  const toolCallId = toolCallDelta.id ?? generateId();

                  if (toolCallDelta.function?.name == null) {
                    throw new InvalidResponseDataError({
                      data: toolCallDelta,
                      message: `Expected 'function.name' to be a string.`,
                    });
                  }

                  toolCalls[index] = {
                    id: toolCallId,
                    type: 'function',
                    function: {
                      name: toolCallDelta.function.name,
                      arguments: toolCallDelta.function.arguments ?? '',
                    },
                    inputStarted: false,
                    sent: false,
                  };

                  const toolCall = toolCalls[index];

                  if (toolCall == null) {
                    throw new Error('Tool call is missing');
                  }

                  // check if tool call is complete (watsonx sends the full tool call in one chunk)
                  if (
                    toolCall.function?.name != null &&
                    toolCall.function?.arguments != null &&
                    isParsableJson(toolCall.function.arguments)
                  ) {
                    toolCall.inputStarted = true;

                    controller.enqueue({
                      type: 'tool-input-start',
                      id: toolCall.id,
                      toolName: toolCall.function.name,
                    });

                    // send delta
                    controller.enqueue({
                      type: 'tool-input-delta',
                      id: toolCall.id,
                      delta: toolCall.function.arguments,
                    });

                    controller.enqueue({
                      type: 'tool-input-end',
                      id: toolCall.id,
                    });

                    // send tool call
                    controller.enqueue({
                      type: 'tool-call',
                      toolCallId: toolCall.id,
                      toolName: toolCall.function.name,
                      input: toolCall.function.arguments,
                    });

                    toolCall.sent = true;
                  }

                  continue;
                }

                // existing tool call, merge (though watsonx typically sends complete tool calls)
                const toolCall = toolCalls[index];

                if (toolCall == null) {
                  throw new Error('Tool call is missing');
                }

                if (!toolCall.inputStarted) {
                  toolCall.inputStarted = true;
                  controller.enqueue({
                    type: 'tool-input-start',
                    id: toolCall.id,
                    toolName: toolCall.function.name,
                  });
                }

                if (toolCallDelta.function?.arguments != null) {
                  toolCall.function.arguments +=
                    toolCallDelta.function?.arguments ?? '';
                }

                // send delta
                controller.enqueue({
                  type: 'tool-input-delta',
                  id: toolCall.id,
                  delta: toolCallDelta.function.arguments ?? '',
                });

                // check if tool call is complete
                if (
                  toolCall.function?.name != null &&
                  toolCall.function?.arguments != null &&
                  isParsableJson(toolCall.function.arguments)
                ) {
                  controller.enqueue({
                    type: 'tool-call',
                    toolCallId: toolCall.id ?? generateId(),
                    toolName: toolCall.function.name,
                    input: toolCall.function.arguments,
                  });

                  toolCall.sent = true;
                }
              }
            }
          },

          flush(controller) {
            // Forward any unsent tool calls if finish reason is 'tool-calls'
            if (finishReason === 'tool-calls') {
              for (const toolCall of toolCalls) {
                if (toolCall && !toolCall.sent) {
                  controller.enqueue({
                    type: 'tool-call',
                    toolCallId: toolCall.id ?? generateId(),
                    toolName: toolCall.function.name,
                    // Coerce invalid arguments to an empty JSON object
                    input: isParsableJson(toolCall.function.arguments)
                      ? toolCall.function.arguments
                      : '{}',
                  });
                  toolCall.sent = true;
                }
              }
            }

            if (textStarted) {
              controller.enqueue({
                type: 'text-end',
                id: textId || generateId(),
              });
            }

            controller.enqueue({
              type: 'finish',
              finishReason,
              usage,
            });
          },
        }),
      ),
      warnings,
      request: { body },
      response: { headers: responseHeaders },
    };
  }
}
