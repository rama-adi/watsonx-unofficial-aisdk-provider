import {
  TooManyEmbeddingValuesForCallError,
  type EmbeddingModelV2,
} from '@ai-sdk/provider';
import {
  combineHeaders,
  createJsonResponseHandler,
  postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod/v4';
import { watsonxFailedResponseHandler } from '../../types/watsonx-response-schema.ts';
import type {
  WatsonxEmbeddingConfig,
  WatsonxEmbeddingModelId,
  WatsonxEmbeddingSetting,
} from './watsonx-embedding-model-settings.ts';
import { systemDetailsSchema } from '../../types/watsonx-common-schema.ts';

export class WatsonxEmbeddingModel implements EmbeddingModelV2<string> {
  private readonly config: WatsonxEmbeddingConfig;

  readonly specificationVersion = 'v2';
  readonly modelId: WatsonxEmbeddingModelId;

  private readonly settings: WatsonxEmbeddingSetting;

  get provider(): string {
    return this.config.provider;
  }

  get maxEmbeddingsPerCall(): number {
    return this.settings.maxEmbeddingsPerCall ?? 32;
  }

  get supportsParallelCalls(): boolean {
    // Parallel calls are technically possible,
    // but I have been hitting rate limits and disable them for now.
    return this.settings.supportsParallelCalls ?? false;
  }

  constructor(
    modelId: WatsonxEmbeddingModelId,
    settings: WatsonxEmbeddingSetting,
    config: WatsonxEmbeddingConfig,
  ) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }

  #WatsonxTextEmbeddingResponseSchema = z.object({
    model_id: z.string(),
    results: z.array(
      z.object({
        embedding: z.array(z.number()),
        input: z
          .object({
            text: z.string(),
          })
          .nullish(),
      }),
    ),
    created_at: z.string(),
    input_token_count: z.number(),
    system: systemDetailsSchema,
  });

  async doEmbed({
    values,
    abortSignal,
    headers,
  }: Parameters<EmbeddingModelV2<string>['doEmbed']>[0]): Promise<
    Awaited<ReturnType<EmbeddingModelV2<string>['doEmbed']>>
  > {
    if (values.length > this.maxEmbeddingsPerCall) {
      throw new TooManyEmbeddingValuesForCallError({
        provider: this.provider,
        modelId: this.modelId,
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        values,
      });
    }

    const { responseHeaders, value: response } = await postJsonToApi({
      url: `${this.config.clusterURL}/text/embeddings?version=${this.config.version}`,
      headers: combineHeaders(this.config.headers(), headers),
      body: {
        model_id: this.modelId,
        project_id: this.config.projectID,
        inputs: values,
        encoding_format: 'float',
        ...(this.settings.truncate_input_tokens != null ||
        this.settings.return_options != null
          ? {
              parameters: {
                ...(this.settings.truncate_input_tokens != null
                  ? { truncate_input_tokens: this.settings.truncate_input_tokens }
                  : {}),
                ...(this.settings.return_options != null
                  ? { return_options: this.settings.return_options }
                  : {}),
              },
            }
          : {}),
      },
      failedResponseHandler: watsonxFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        this.#WatsonxTextEmbeddingResponseSchema,
      ),
      abortSignal,
      fetch: this.config.fetch,
    });
    return {
      embeddings: response.results.map((r) => r.embedding),
      usage: {
        tokens: response.input_token_count,
      },
      response: { headers: responseHeaders },
    };
  }
}
