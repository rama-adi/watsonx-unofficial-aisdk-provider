# @rama-adi/watsonx-unofficial-ai-provider

## 0.0.2-alpha.2

### Features
- Cluster-aware model type hints: Introduced `WatsonxCluster` and region-specific helper types (`WatsonxChatModelIdFor<C>`, `WatsonxEmbeddingModelIdFor<C>`, `WatsonxCompletionModelIdFor<C>`). When you initialize with a literal `cluster`, IDE autocompletion now suggests only models available in that region while still allowing arbitrary strings.

### Improvements
- Provider generics and overloads: `createWatsonx` and `WatsonxProvider` are now generic over cluster, narrowing model IDs across `languageModel`, `embedding`, `textEmbeddingModel`, `textEmbedding`, and `completion`.
- Re-exported new types from `index.ts` for easier consumption.
- Backwards compatible: No runtime changes; types default to all regions when the cluster is not a literal.

### Bug Fixes
- Corrected `languageModel` parameter type to use chat model IDs.

## 0.0.2-alpha.1

### Breaking Changes
- Migrate to AI SDK v5 `ProviderV2` interface.

### Features
- New `embedding`, `textEmbeddingModel`, and `textEmbedding` helpers on the provider.
- Export model ID lists: `ChatModelLists`, `FunctionCallingModelLists`, `VisionModelLists`, and `CompletionModelLists`.

### Improvements
- Environment variable support: `WATSONX_CLUSTER`, `WATSONX_CLUSTER_URL`, `WATSONX_PROJECT_ID`, `WATSONX_BEARER_TOKEN`.
- Better README with streaming and embeddings examples.

## 0.0.1-alpha.1

### Bug Fixes
- Added exports for list of models available as a const array
- Improved type safety for model settings
- Fixed model ID updates and synchronization

### Infrastructure
- Switched from Bun to npm for package management
- Added Biome for code formatting and linting
- Improved build configuration

## 0.0.1-alpha.0

### Features
- Initial Release of watsonx unofficial provider
- Basic completion model implementation
- Support for core AI SDK provider interface
- Support for chat, completion, and embedding models
- Demo applications for various use cases