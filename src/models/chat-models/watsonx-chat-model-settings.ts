import {z} from "zod";
import {watsonxCommonResponseSchema} from "../../types/watsonx-common-response-schema.ts";
import type {FetchFunction} from "@ai-sdk/provider-utils";

// <autogen watsonx-chat-model-ids>
// ⚠️ WARNING: This section that is marked by the autogen ID of watsonx-chat-model-ids (top and bottom) is auto-generated.
// Do not edit manually.
// Generated on: 2025-04-27T19:54:23.590Z
// Description: All of the supported models fetched from watsonx API. This only take account non-deprecated models.

// Models here can be called from the /chat endpoint
// and supports the `CoreMessage[]` type
export type WatsonxChatModelId =
    | 'ibm/granite-3-2b-instruct'
    | 'ibm/granite-3-8b-instruct'
    | 'meta-llama/llama-3-2-11b-vision-instruct'
    | 'meta-llama/llama-3-3-70b-instruct'
    | 'meta-llama/llama-guard-3-11b-vision'
    | 'mistralai/mixtral-8x7b-instruct-v01'
    | (string & {})

// Some chat models support function calling
export const functionCallingModels = [
      'ibm/granite-3-2b-instruct',
      'ibm/granite-3-8b-instruct',
      'meta-llama/llama-3-2-11b-vision-instruct',
      'meta-llama/llama-3-3-70b-instruct'
] as const
// </autogen watsonx-chat-model-ids>

// watsonx AI SDK provider chat settings
export type WatsonxChatConfig = {
    provider: string;
    clusterURL: string;
    projectID: string;
    headers: () => Record<string, string | undefined>;
    fetch?: FetchFunction;
    version: string;
}

// watsonx specific settings parameters
export interface WatsonxChatSetting {
    moderations?: z.infer<typeof watsonxCommonResponseSchema>
}