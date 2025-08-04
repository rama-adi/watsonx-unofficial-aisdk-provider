import type { z } from 'zod';
import type { watsonxModerationsSchema } from '../../types/watsonx-common-schema.ts';
import type { FetchFunction } from '@ai-sdk/provider-utils';

// <autogen watsonx-chat-model-ids>
// ⚠️ WARNING: This section that is marked by the autogen ID of watsonx-chat-model-ids (top and bottom) is auto-generated.
// Do not edit manually.
// Generated on: 2025-08-04T08:56:35.652Z
// Description: All of the supported models fetched from watsonx API. This only take account non-deprecated models.

// Models here can be called from the /chat endpoint
// and supports the `CoreMessage[]` type
export const ChatModelLists = [
  'ibm/granite-3-2b-instruct',
  'ibm/granite-3-8b-instruct',
  'meta-llama/llama-3-2-11b-vision-instruct',
  'meta-llama/llama-3-3-70b-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
  'meta-llama/llama-guard-3-11b-vision',
  'mistralai/mistral-medium-2505',
  'mistralai/mistral-small-3-1-24b-instruct-2503',
] as const;

// Type generated from the array
export type WatsonxChatModelId =
  | (typeof ChatModelLists)[number]
  | (string & {});

// Vision model
export const VisionModelLists = [
  'meta-llama/llama-3-2-11b-vision-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
  'meta-llama/llama-guard-3-11b-vision',
  'mistralai/mistral-medium-2505',
  'mistralai/mistral-small-3-1-24b-instruct-2503',
] as const;

// Function calling model
export const FunctionCallingModelLists = [
  'ibm/granite-3-2b-instruct',
  'ibm/granite-3-8b-instruct',
  'meta-llama/llama-3-2-11b-vision-instruct',
  'meta-llama/llama-3-3-70b-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
  'mistralai/mistral-medium-2505',
  'mistralai/mistral-small-3-1-24b-instruct-2503',
] as const;
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
