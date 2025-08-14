import type { z } from 'zod/v4';
import type {
  WatsonxCluster,
  watsonxModerationsSchema,
} from '../../types/watsonx-common-schema.ts';
import type { FetchFunction } from '@ai-sdk/provider-utils';

// <autogen watsonx-completion-model-ids>
// ⚠️ WARNING: This section that is marked by the autogen ID of watsonx-completion-model-ids (top and bottom) is auto-generated.
// Do not edit manually.
// Generated on: 2025-08-14T04:02:59.211Z
// Description: All of the supported completion models fetched from watsonx API by region. Only non-deprecated models are included.

// Models here can be called from the /chat endpoint
// and supports the `CoreMessage[]` type
export const CompletionModelLists = {
  'ca-tor': [],
  'jp-tok': [],
  'eu-gb': [],
  'eu-de': ['sdaia/allam-1-13b-instruct'],
  'us-south': ['ibm/granite-8b-code-instruct'],
  'au-syd': ['ibm/granite-8b-code-instruct'],
} as const;

export type WatsonxCompletionRegion = keyof typeof CompletionModelLists;

// Type generated from the object
export type WatsonxCompletionModelId =
  | (typeof CompletionModelLists)[WatsonxCompletionRegion][number]
  | (string & {});

// Region-specific helper type for IDE hinting based on chosen cluster
export type WatsonxCompletionModelIdFor<C extends WatsonxCluster> =
  | (typeof CompletionModelLists)[C][number]
  | (string & {});

// </autogen watsonx-completion-model-ids>

// watsonx AI SDK provider chat settings
export type WatsonxCompletionConfig = {
  provider: string;
  clusterURL: string;
  projectID: string;
  headers: () => Record<string, string | undefined>;
  fetch?: FetchFunction;
  version: string;
};

// watsonx specific settings parameters
export interface WatsonxCompletionSetting {
  moderations?: z.infer<typeof watsonxModerationsSchema>;
  decodingMethod?: 'sample' | 'greedy';
  returnInputText?: boolean;
  maxNewTokens?: number;
  minNewTokens?: number;
  returnOptions?: {
    inputText?: boolean;
    generatedTokens?: boolean;
  };
  textgenLengthPenalty?: {
    decayFactor?: number;
    startIndex?: number;
  };
}
