import {z} from "zod";
import {watsonxModerationsSchema} from "../../types/watsonx-common-schema.ts";
import type {FetchFunction} from "@ai-sdk/provider-utils";

// <autogen watsonx-completion-model-ids>
// ⚠️ WARNING: This section that is marked by the autogen ID of watsonx-completion-model-ids (top and bottom) is auto-generated.
// Do not edit manually.
// Generated on: 2025-04-27T19:54:23.595Z
// Description: All of the supported completion models fetched from watsonx API. This only take account non-deprecated models.

// Models here can be called from the /chat endpoint
// and supports the `CoreMessage[]` type
export type WatsonxCompletionModelId =
    | 'elyza/elyza-japanese-llama-2-7b-instruct'
    | 'google/flan-t5-xl'
    | 'google/flan-t5-xxl'
    | 'google/flan-ul2'
    | 'ibm/granite-13b-instruct-v2'
    | (string & {})
// </autogen watsonx-completion-model-ids>

// watsonx AI SDK provider chat settings
export type WatsonxCompletionConfig = {
    provider: string;
    clusterURL: string;
    projectID: string;
    headers: () => Record<string, string | undefined>;
    fetch?: FetchFunction;
    version: string;
}

// watsonx specific settings parameters
export interface WatsonxCompletionSetting {
    moderations?: z.infer<typeof watsonxModerationsSchema>,
    decodingMethod?: 'sample' | 'greedy',
    returnInputText?: boolean,
    maxNewTokens?: number,
    minNewTokens?: number,
    returnOptions?: {
        inputText?: boolean,
        generatedTokens?: boolean
    },
    textgenLengthPenalty?: {
        decayFactor?: number,
        startIndex?: number
    }
}