import {
  UnsupportedFunctionalityError,
  type LanguageModelV2,
  type LanguageModelV2CallOptions,
  type LanguageModelV2CallWarning,
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
  postJsonToApi,
  generateId,
} from '@ai-sdk/provider-utils';
import { z } from 'zod/v4';
import { watsonxFailedResponseHandler } from '../../types/watsonx-response-schema.ts';
import { getResponseMetadata } from '../../utils/get-response-metadata.ts';
import type {
  WatsonxCompletionConfig,
  WatsonxCompletionModelId,
  WatsonxCompletionSetting,
} from './watsonx-completion-model-settings.ts';
import { convertToWatsonxCompletion } from './convert-to-watsonx-completion.ts';
import {
  watsonxCompletionChunkSchema,
  watsonxCompletionResponseSchema,
} from './watsonx-completion-schema.ts';
import { mapWatsonxCompletionFinishReason } from './watsonx-completion-finish-reason.ts';

export class WatsonxCompletionModel implements LanguageModelV2 {
  readonly specificationVersion = 'v2' as const;
  readonly provider: string;
  readonly defaultObjectGenerationMode = undefined;
  readonly supportsImageUrls = false;
  readonly supportedUrls: Record<string, RegExp[]> = {};

  readonly modelId: WatsonxCompletionModelId;
  readonly settings: WatsonxCompletionSetting;
  private readonly config: WatsonxCompletionConfig;

  constructor(
    modelId: WatsonxCompletionModelId,
    settings: WatsonxCompletionSetting,
    config: WatsonxCompletionConfig,
  ) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
    this.provider = config.provider;
  }

  private getArgs(options: LanguageModelV2CallOptions): {
    args: any;
    warnings: LanguageModelV2CallWarning[];
  } {
    const {
      prompt,
      maxOutputTokens,
      temperature,
      topP,
      topK,
      frequencyPenalty,
      presencePenalty,
      stopSequences: userStopSequences,
      responseFormat,
      seed,
      providerOptions,
    } = options;

    const warnings: LanguageModelV2CallWarning[] = [];

    if (responseFormat != null && responseFormat.type !== 'text') {
      warnings.push({
        type: 'unsupported-setting',
        setting: 'responseFormat',
      });
    }

    const { prompt: completionPrompt, stopSequences } =
      convertToWatsonxCompletion({
        prompt,
        inputFormat: 'prompt',
      });

    const stop = [...(stopSequences ?? []), ...(userStopSequences ?? [])];

    // Reconstruct body to map with what watsonx expects
    const baseArgs: any = {
      model_id: this.modelId,
      project_id: this.config.projectID,
      input: completionPrompt,
      parameters: {
        // sampling & decoding
        decoding_method: this.settings.decodingMethod ?? 'greedy',
        temperature,
        top_p: topP,
        top_k: topK,
        // penalties and limits
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        max_new_tokens: maxOutputTokens ?? this.settings.maxNewTokens,
        min_new_tokens: this.settings.minNewTokens,
        // control & misc
        stop_sequences: stop,
        random_seed: seed,
        time_limit: providerOptions?.watsonx?.timeLimit,
        ...(this.settings.textgenLengthPenalty !== undefined
          ? {
              length_penalty: {
                decay_factor: this.settings.textgenLengthPenalty.decayFactor,
                start_index: this.settings.textgenLengthPenalty.startIndex,
              },
            }
          : {}),
      },
      return_options: {
        input_text: this.settings.returnOptions?.inputText ?? false,
        generated_tokens: this.settings.returnOptions?.generatedTokens ?? false,
      },
    };

    return { args: baseArgs, warnings };
  }

  async doGenerate(options: LanguageModelV2CallOptions): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    finishReason: LanguageModelV2FinishReason;
    usage: LanguageModelV2Usage;
    warnings: Array<LanguageModelV2CallWarning>;
    request?: { body?: unknown };
    response?: LanguageModelV2ResponseMetadata & {
      headers?: SharedV2Headers;
      body?: unknown;
    };
  }> {
    const { args, warnings } = this.getArgs(options);

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
        watsonxCompletionResponseSchema,
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch,
    });

    const { messages: rawPrompt, ...rawSettings } = args;
    const choice = response.results[0];

    if (!choice) {
      throw new Error('No choice in response');
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: choice.generated_text,
        },
      ],
      finishReason: mapWatsonxCompletionFinishReason(choice.stop_reason),
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? NaN,
        outputTokens: response.usage?.completion_tokens ?? NaN,
        totalTokens:
          (response.usage?.prompt_tokens ?? 0) +
          (response.usage?.completion_tokens ?? 0),
      },
      warnings,
      request: { body: args },
      response: {
        id: generateId(),
        modelId: response.model_id,
        headers: responseHeaders,
        body: rawResponse,
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
    const url = `${this.config.clusterURL}/text/generation_stream?version=${this.config.version}`;

    const { args, warnings } = this.getArgs(options);

    const body = {
      ...args,
      stream: true,
    };

    const { value: response, responseHeaders } = await postJsonToApi({
      url,
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: watsonxFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        watsonxCompletionChunkSchema,
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch,
    });

    let finishReason: LanguageModelV2FinishReason = 'other';
    let usage: LanguageModelV2Usage = {
      inputTokens: Number.NaN,
      outputTokens: Number.NaN,
      totalTokens: Number.NaN,
    };
    let isFirstChunk = true;

    return {
      stream: response.pipeThrough(
        new TransformStream<
          ParseResult<z.infer<typeof watsonxCompletionChunkSchema>>,
          LanguageModelV2StreamPart
        >({
          transform(chunk, controller) {
            // handle failed chunk parsing / validation:
            if (!chunk.success) {
              finishReason = 'error';
              controller.enqueue({ type: 'error', error: chunk.error });
              return;
            }

            const value = chunk.value;

            // handle error chunks:
            if ('error' in value) {
              finishReason = 'error';
              controller.enqueue({ type: 'error', error: value.error });
              return;
            }

            if (isFirstChunk) {
              isFirstChunk = false;
              controller.enqueue({
                type: 'response-metadata',
                id: value.id ?? generateId(),
                modelId: value.model_id ?? undefined,
                timestamp:
                  value.created != null
                    ? new Date(value.created * 1000)
                    : undefined,
              });
            }

            if (value.usage != null) {
              usage = {
                inputTokens: value.usage.prompt_tokens,
                outputTokens: value.usage.completion_tokens,
                totalTokens:
                  value.usage.prompt_tokens + value.usage.completion_tokens,
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
                id: generateId(),
                delta: choice.generated_text,
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
      warnings,
      request: { body },
      response: { headers: responseHeaders },
    };
  }
}
