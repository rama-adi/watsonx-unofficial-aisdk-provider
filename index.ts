// Base provider
export { createWatsonx, watsonx } from './src/provider';
export type { WatsonxProvider, WatsonxProviderSetting } from './src/provider';
export type { WatsonxCluster } from './src/types/watsonx-common-schema';

// Chat model lists
export {
  ChatModelLists,
  FunctionCallingModelLists,
  VisionModelLists,
} from './src/models/chat-models/watsonx-chat-model-settings';
export type {
  WatsonxChatModelId,
  WatsonxChatModelIdFor,
  WatsonxChatRegion,
} from './src/models/chat-models/watsonx-chat-model-settings';

// Embedding Model
export { EmbedingModelLists } from './src/models/embedding-models/watsonx-embedding-model-settings';
export type {
  WatsonxEmbeddingModelId,
  WatsonxEmbeddingModelIdFor,
  WatsonxEmbeddingRegion,
} from './src/models/embedding-models/watsonx-embedding-model-settings';

// Completion Model
export { CompletionModelLists } from './src/models/completion-models/watsonx-completion-model-settings';
export type {
  WatsonxCompletionModelId,
  WatsonxCompletionModelIdFor,
  WatsonxCompletionRegion,
} from './src/models/completion-models/watsonx-completion-model-settings';
