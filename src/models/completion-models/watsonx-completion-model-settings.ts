import type { z } from 'zod/v4';
import type { watsonxModerationsSchema } from '../../types/watsonx-common-schema.ts';
import type { FetchFunction } from '@ai-sdk/provider-utils';

// <autogen watsonx-completion-model-ids>
// ⚠️ WARNING: This section that is marked by the autogen ID of watsonx-completion-model-ids (top and bottom) is auto-generated.
// Do not edit manually.
// Generated on: 2025-08-04T08:56:35.660Z
// Description: All of the supported completion models fetched from watsonx API. This only take account non-deprecated models.

// Models here can be called from the /chat endpoint
// and supports the `CoreMessage[]` type
export const CompletionModelLists = [] as const;

// Type generated from the array
export type WatsonxCompletionModelId =
  | (typeof CompletionModelLists)[number]
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
