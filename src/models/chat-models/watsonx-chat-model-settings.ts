import type { z } from 'zod/v4';
import type {
  WatsonxCluster,
  watsonxModerationsSchema,
} from '../../types/watsonx-common-schema.ts';
import type { FetchFunction } from '@ai-sdk/provider-utils';

// <autogen watsonx-chat-model-ids>
// ⚠️ WARNING: This section that is marked by the autogen ID of watsonx-chat-model-ids (top and bottom) is auto-generated.
// Do not edit manually.
// Generated on: 2025-08-14T04:02:59.203Z
// Description: All of the supported models fetched from watsonx API by region. Only non-deprecated models are included.

// Models here can be called from the /chat endpoint
// and supports the `CoreMessage[]` type
export const ChatModelLists = {
  'ca-tor': [
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-3-70b-instruct',
  ],
  'jp-tok': [
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-3-70b-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    'meta-llama/llama-guard-3-11b-vision',
    'mistralai/mistral-medium-2505',
    'mistralai/mistral-small-3-1-24b-instruct-2503',
  ],
  'eu-gb': [
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-3-70b-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
  ],
  'eu-de': [
    'ibm/granite-3-3-8b-instruct',
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-2-90b-vision-instruct',
    'meta-llama/llama-3-3-70b-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    'mistralai/mistral-medium-2505',
    'mistralai/mistral-small-3-1-24b-instruct-2503',
  ],
  'us-south': [
    'ibm/granite-3-2-8b-instruct',
    'ibm/granite-3-3-8b-instruct',
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-2-90b-vision-instruct',
    'meta-llama/llama-3-3-70b-instruct',
    'meta-llama/llama-3-405b-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    'meta-llama/llama-guard-3-11b-vision',
    'mistralai/mistral-medium-2505',
    'mistralai/mistral-small-3-1-24b-instruct-2503',
    'openai/gpt-oss-120b',
  ],
  'au-syd': [
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-2-90b-vision-instruct',
    'meta-llama/llama-guard-3-11b-vision',
  ],
} as const;

export type WatsonxChatRegion = keyof typeof ChatModelLists;

// Type generated from the object
export type WatsonxChatModelId =
  | (typeof ChatModelLists)[WatsonxChatRegion][number]
  | (string & {});

// Region-specific helper type for IDE hinting based on chosen cluster
export type WatsonxChatModelIdFor<C extends WatsonxCluster> =
  | (typeof ChatModelLists)[C][number]
  | (string & {});

// Vision model
export const VisionModelLists = {
  'ca-tor': ['meta-llama/llama-3-2-11b-vision-instruct'],
  'jp-tok': [
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    'meta-llama/llama-guard-3-11b-vision',
    'mistralai/mistral-medium-2505',
    'mistralai/mistral-small-3-1-24b-instruct-2503',
  ],
  'eu-gb': [
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
  ],
  'eu-de': [
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-2-90b-vision-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    'mistralai/mistral-medium-2505',
    'mistralai/mistral-small-3-1-24b-instruct-2503',
  ],
  'us-south': [
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-2-90b-vision-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    'meta-llama/llama-guard-3-11b-vision',
    'mistralai/mistral-medium-2505',
    'mistralai/mistral-small-3-1-24b-instruct-2503',
  ],
  'au-syd': [
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-2-90b-vision-instruct',
    'meta-llama/llama-guard-3-11b-vision',
  ],
} as const;

// Function calling model
export const FunctionCallingModelLists = {
  'ca-tor': [
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-3-70b-instruct',
  ],
  'jp-tok': [
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-3-70b-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    'mistralai/mistral-medium-2505',
    'mistralai/mistral-small-3-1-24b-instruct-2503',
  ],
  'eu-gb': [
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-3-70b-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
  ],
  'eu-de': [
    'ibm/granite-3-3-8b-instruct',
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-2-90b-vision-instruct',
    'meta-llama/llama-3-3-70b-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    'mistralai/mistral-medium-2505',
    'mistralai/mistral-small-3-1-24b-instruct-2503',
  ],
  'us-south': [
    'ibm/granite-3-2-8b-instruct',
    'ibm/granite-3-3-8b-instruct',
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-2-90b-vision-instruct',
    'meta-llama/llama-3-3-70b-instruct',
    'meta-llama/llama-3-405b-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    'mistralai/mistral-medium-2505',
    'mistralai/mistral-small-3-1-24b-instruct-2503',
    'openai/gpt-oss-120b',
  ],
  'au-syd': [
    'ibm/granite-3-8b-instruct',
    'meta-llama/llama-3-2-11b-vision-instruct',
    'meta-llama/llama-3-2-90b-vision-instruct',
  ],
} as const;
// </autogen watsonx-chat-model-ids>

// watsonx AI SDK provider chat settings
export type WatsonxChatConfig = {
  provider: string;
  clusterURL: string;
  projectID: string;
  headers: () => Record<string, string | undefined>;
  fetch?: FetchFunction;
  version: string;
};

// watsonx specific settings parameters
export interface WatsonxChatSetting {
  moderations?: z.infer<typeof watsonxModerationsSchema>;
}
