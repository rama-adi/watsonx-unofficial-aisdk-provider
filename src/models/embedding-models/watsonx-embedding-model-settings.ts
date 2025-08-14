import type { FetchFunction } from '@ai-sdk/provider-utils';
import type { WatsonxCluster } from '../../types/watsonx-common-schema.ts';

// <autogen watsonx-embedding-model-ids>
// ⚠️ WARNING: This section that is marked by the autogen ID of watsonx-embedding-model-ids (top and bottom) is auto-generated.
// Do not edit manually.
// Generated on: 2025-08-14T04:02:59.204Z
// Description: All of the supported embedding models fetched from watsonx API by region. Only non-deprecated models are included.

// Models here can be called from the /chat endpoint
// and supports the `CoreMessage[]` type
export const EmbedingModelLists = {
  'ca-tor': [
    'ibm/granite-embedding-278m-multilingual',
    'ibm/slate-125m-english-rtrvr-v2',
    'ibm/slate-30m-english-rtrvr-v2',
    'intfloat/multilingual-e5-large',
  ],
  'jp-tok': [
    'ibm/granite-embedding-278m-multilingual',
    'ibm/slate-125m-english-rtrvr-v2',
    'ibm/slate-30m-english-rtrvr-v2',
    'intfloat/multilingual-e5-large',
    'sentence-transformers/all-minilm-l6-v2',
  ],
  'eu-gb': [
    'ibm/granite-embedding-278m-multilingual',
    'ibm/slate-125m-english-rtrvr-v2',
    'ibm/slate-30m-english-rtrvr-v2',
    'intfloat/multilingual-e5-large',
    'sentence-transformers/all-minilm-l6-v2',
  ],
  'eu-de': [
    'ibm/granite-embedding-278m-multilingual',
    'ibm/slate-125m-english-rtrvr-v2',
    'ibm/slate-30m-english-rtrvr-v2',
    'intfloat/multilingual-e5-large',
    'sentence-transformers/all-minilm-l6-v2',
  ],
  'us-south': [
    'ibm/granite-embedding-278m-multilingual',
    'ibm/slate-125m-english-rtrvr-v2',
    'ibm/slate-30m-english-rtrvr-v2',
    'intfloat/multilingual-e5-large',
    'sentence-transformers/all-minilm-l6-v2',
  ],
  'au-syd': [
    'ibm/slate-125m-english-rtrvr-v2',
    'ibm/slate-30m-english-rtrvr-v2',
    'intfloat/multilingual-e5-large',
  ],
} as const;

export type WatsonxEmbeddingRegion = keyof typeof EmbedingModelLists;

// Type generated from the object
export type WatsonxEmbeddingModelId =
  | (typeof EmbedingModelLists)[WatsonxEmbeddingRegion][number]
  | (string & {});

// Region-specific helper type for IDE hinting based on chosen cluster
export type WatsonxEmbeddingModelIdFor<C extends WatsonxCluster> =
  | (typeof EmbedingModelLists)[C][number]
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
