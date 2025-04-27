// <autogen watsonx-settings-models>
// ⚠️ WARNING: This section that is marked by the autogen ID of watsonx-settings-models (top and bottom) is auto-generated.
// Do not edit manually.
// Generated on: 2025-04-27T07:19:04.272Z
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

// This is a traditional completion model
// If you want QnA capabilities, you must supply the correct token
// delimiter yourself in the prompt section
export type WatsonxTextCompletionModelId =
  | 'elyza/elyza-japanese-llama-2-7b-instruct'
  | 'google/flan-t5-xl'
  | 'google/flan-t5-xxl'
  | 'google/flan-ul2'
  | 'ibm/granite-13b-instruct-v2'
  | (string & {})

// All the embedding models
export type WatsonxEmbeddingModelId =
  | 'ibm/granite-embedding-107m-multilingual'
  | 'ibm/granite-embedding-278m-multilingual'
  | 'ibm/slate-125m-english-rtrvr'
  | 'ibm/slate-125m-english-rtrvr-v2'
  | 'ibm/slate-30m-english-rtrvr'
  | 'ibm/slate-30m-english-rtrvr-v2'
  | 'intfloat/multilingual-e5-large'
  | 'sentence-transformers/all-minilm-l12-v2'
  | 'sentence-transformers/all-minilm-l6-v2'
  | (string & {})

// Some chat models support function calling
export const functionCallingModels = [
  'ibm/granite-3-2b-instruct',
  'ibm/granite-3-8b-instruct',
  'meta-llama/llama-3-2-11b-vision-instruct',
  'meta-llama/llama-3-3-70b-instruct'
] as const
// </autogen watsonx-settings-models>
// Amogus 

export interface WatsonxChatSetting {}