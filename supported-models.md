# Watsonx Unofficial SDK — Supported Models

This document outlines the types of models supported by the Watsonx Unofficial SDK.  
Models are categorized by their capabilities and use cases. This document will be updated as new models are added or
existing ones are deprecated.

## 1. Chat Models

Chat models are designed for conversational AI applications, enabling natural language understanding and generation.
They use the `CoreMessage[]` type from the AI SDK to structure user, assistant, and system messages.

In most cases, **chat models** are what you'll want to use.  
Some chat models also support **function calling**, allowing more advanced interactions like structured outputs.

> [!NOTE]  
> Structured output requires models that support function calling.  
> (Structured output *without* function calling is not yet implemented.)

### Supported Chat Models

<!-- <autogen readme-chat-models> -->
<!-- ⚠️ WARNING: This section that is marked by the autogen ID of readme-chat-models (top and bottom) is auto-generated. -->
<!-- Do not edit manually. -->
<!-- Generated on: 2025-08-14T04:02:59.208Z -->
<!-- Description: Chat models tables grouped by model with available regions per model. -->

| ID | Provider | Function Calling | Structured Outputs | Regions |
|----|----------|------------------|--------------------|---------|
| `ibm/granite-3-2-8b-instruct` | IBM | ✅ | ✅ | us-south |
| `ibm/granite-3-3-8b-instruct` | IBM | ✅ | ✅ | eu-de, us-south |
| `ibm/granite-3-8b-instruct` | IBM | ✅ | ✅ | ca-tor, jp-tok, eu-gb, eu-de, us-south, au-syd |
| `meta-llama/llama-3-2-11b-vision-instruct` | Meta | ✅ | ✅ | ca-tor, jp-tok, eu-gb, eu-de, us-south, au-syd |
| `meta-llama/llama-3-2-90b-vision-instruct` | Meta | ✅ | ✅ | eu-de, us-south, au-syd |
| `meta-llama/llama-3-3-70b-instruct` | Meta | ✅ | ✅ | ca-tor, jp-tok, eu-gb, eu-de, us-south |
| `meta-llama/llama-3-405b-instruct` | Meta | ✅ | ✅ | us-south |
| `meta-llama/llama-4-maverick-17b-128e-instruct-fp8` | Meta | ✅ | ✅ | jp-tok, eu-gb, eu-de, us-south |
| `meta-llama/llama-guard-3-11b-vision` | Meta | ❌ | ❌ | jp-tok, us-south, au-syd |
| `mistralai/mistral-medium-2505` | Mistral AI | ✅ | ✅ | jp-tok, eu-de, us-south |
| `mistralai/mistral-small-3-1-24b-instruct-2503` | Mistral AI | ✅ | ✅ | jp-tok, eu-de, us-south |
| `openai/gpt-oss-120b` | OpenAI | ✅ | ✅ | us-south |
<!-- </autogen readme-chat-models> -->

### Usage Example

```ts
import {generateText} from 'ai';

// Example of a multi-turn conversation with a Chat Model
const {text} = await generateText({
    model: watsonx('ibm/granite-3-8b-instruct'),
    messages: [
        {role: 'system', content: 'You are a witty travel guide.'},
        {role: 'user', content: 'What should I do for a weekend trip in Japan?'},
    ],
});

// 'text' will contain a playful travel recommendation
```

---

## 2. Embedding Models

Embedding models convert text into dense vector representations that capture the semantic meaning of the input.  
These embeddings are useful for tasks like **semantic search**, **text similarity**, and **clustering**.

### Supported Embedding Models

<!-- <autogen readme-embedding-models> -->
<!-- ⚠️ WARNING: This section that is marked by the autogen ID of readme-embedding-models (top and bottom) is auto-generated. -->
<!-- Do not edit manually. -->
<!-- Generated on: 2025-08-14T04:02:59.209Z -->
<!-- Description: Embedding models tables grouped by model with available regions per model. -->

| ID | Provider | Max Sequence Length | Embedding Dimensions | Regions |
|----|----------|---------------------|----------------------|---------|
| `ibm/granite-embedding-278m-multilingual` | IBM | 512 | 768 | ca-tor, jp-tok, eu-gb, eu-de, us-south |
| `ibm/slate-125m-english-rtrvr-v2` | IBM | 512 | 768 | ca-tor, jp-tok, eu-gb, eu-de, us-south, au-syd |
| `ibm/slate-30m-english-rtrvr-v2` | IBM | 512 | 384 | ca-tor, jp-tok, eu-gb, eu-de, us-south, au-syd |
| `intfloat/multilingual-e5-large` | intfloat | 512 | 1024 | ca-tor, jp-tok, eu-gb, eu-de, us-south, au-syd |
| `sentence-transformers/all-minilm-l6-v2` | sentence-transformers | 256 | 384 | jp-tok, eu-gb, eu-de, us-south |
<!-- </autogen readme-embedding-models> -->

### Usage Example

```ts
import {embed} from 'ai';

// Semantic embedding example
const {embedding} = await embed({
    model: watsonx.embedding('ibm/granite-embedding-278m-multilingual'),
    value: 'An astronaut relaxing on Mars after a long spacewalk',
});

// 'embedding' will be an array of numbers representing the concept
```

---

## 3. Completion Models

Completion models produce text outputs based on a given input prompt.  
Unlike chat models, these do **not** follow the multi-message chat structure — they simply take a prompt and return
generated text. *(In theory, you could do multi-turn conversation if you knew how to format the prompt correctly.)*

### Supported Completion Models

<!-- <autogen readme-completion-models> -->
<!-- ⚠️ WARNING: This section that is marked by the autogen ID of readme-completion-models (top and bottom) is auto-generated. -->
<!-- Do not edit manually. -->
<!-- Generated on: 2025-08-14T04:02:59.210Z -->
<!-- Description: Completion models tables grouped by model with available regions per model. -->

| ID | Provider | Regions |
|----|----------|---------|
| `ibm/granite-8b-code-instruct` | IBM | us-south, au-syd |
| `sdaia/allam-1-13b-instruct` | sdaia | eu-de |
<!-- </autogen readme-completion-models> -->

### Usage Example

```ts
import {generateText} from 'ai';

// Simple creative writing prompt
const {text} = await generateText({
    model: watsonx.completion('google/flan-t5-xxl', {
        returnOptions: {
            inputText: true, // by default, input text is not returned
        }
    }),
    prompt: 'Invent a new ice cream flavor inspired by a magical forest.',
});

// 'text' will contain a whimsical, imaginative ice cream description
```