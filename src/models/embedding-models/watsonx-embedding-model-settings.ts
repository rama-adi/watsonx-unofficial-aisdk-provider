import type { FetchFunction } from '@ai-sdk/provider-utils';

// <autogen watsonx-embedding-model-ids>
// ⚠️ WARNING: This section that is marked by the autogen ID of watsonx-embedding-model-ids (top and bottom) is auto-generated.
// Do not edit manually.
// Generated on: 2025-06-16T17:57:41.878Z
// Description: All of the supported embedding models fetched from watsonx API. This only take account non-deprecated models.

// Models here can be called from the /chat endpoint
// and supports the `CoreMessage[]` type
export const EmbedingModelLists = [
  'ibm/granite-3-2b-instruct',
  'ibm/granite-3-8b-instruct',
  'meta-llama/llama-3-2-11b-vision-instruct',
  'meta-llama/llama-3-3-70b-instruct',
  'meta-llama/llama-guard-3-11b-vision',
  'mistralai/mistral-small-3-1-24b-instruct-2503',
] as const;

// Type generated from the array
export type WatsonxEmbeddingModelId =
  | (typeof EmbedingModelLists)[number]
  | (string & {});

// </autogen watsonx-embedding-model-ids>

// watsonx AI SDK provider embedding settings
export type WatsonxEmbeddingConfig = {
  provider: string;
  clusterURL: string;
  projectID: string;
  headers: () => Record<string, string | undefined>;
  fetch?: FetchFunction;
  version: string;
};

export interface WatsonxEmbeddingSetting {
  /**
     Represents the maximum number of tokens accepted per input.
     This can be used to avoid requests failing due to input being longer than configured limits. If the text is truncated, then it truncates the end of the input (on the right),
     so the start of the input will remain the same.
     If this value exceeds the maximum sequence length (refer to the documentation to find this value for the model)
     then the call will fail if the total number of tokens exceeds the maximum sequence length.
     */
  truncate_input_tokens?: number;

  /**
     Maximum number of embeddings that can be requested in a single call.
     */
  maxEmbeddingsPerCall?: number;

  /**
     Whether the model supports parallel embedding calls.
     */
  supportsParallelCalls?: boolean;

  /**
     Include the input text in each of the results documents.
     */
  return_options?: {
    input_text?: boolean;
  };
}
