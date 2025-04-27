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
<!-- Generated on: 2025-04-27T15:47:14.665Z -->
<!-- Description: Chat models tables -->

| ID                                         | Provider   | Function Calling | Structured Outputs |
|--------------------------------------------|------------|------------------|--------------------|
| `ibm/granite-3-2b-instruct`                | IBM        | ✅                | ✅                  |
| `ibm/granite-3-8b-instruct`                | IBM        | ✅                | ✅                  |
| `meta-llama/llama-3-2-11b-vision-instruct` | Meta       | ✅                | ✅                  |
| `meta-llama/llama-3-3-70b-instruct`        | Meta       | ✅                | ✅                  |
| `meta-llama/llama-guard-3-11b-vision`      | Meta       | ❌                | ❌                  |
| `mistralai/mixtral-8x7b-instruct-v01`      | Mistral AI | ❌                | ❌                  |

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
<!-- Generated on: 2025-04-27T15:47:14.666Z -->
<!-- Description: Embedding models tables -->

| ID                                        | Provider              | Max Sequence Length | Embedding Dimensions |
|-------------------------------------------|-----------------------|---------------------|----------------------|
| `ibm/granite-embedding-107m-multilingual` | IBM                   | 512                 | 384                  |
| `ibm/granite-embedding-278m-multilingual` | IBM                   | 512                 | 768                  |
| `ibm/slate-125m-english-rtrvr`            | IBM                   | 512                 | 768                  |
| `ibm/slate-125m-english-rtrvr-v2`         | IBM                   | 512                 | 768                  |
| `ibm/slate-30m-english-rtrvr`             | IBM                   | 512                 | 384                  |
| `ibm/slate-30m-english-rtrvr-v2`          | IBM                   | 512                 | 384                  |
| `intfloat/multilingual-e5-large`          | intfloat              | 512                 | 1024                 |
| `sentence-transformers/all-minilm-l12-v2` | sentence-transformers | 128                 | 384                  |
| `sentence-transformers/all-minilm-l6-v2`  | sentence-transformers | 256                 | 384                  |

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

## 3. Text Generation Models

Text generation models produce text outputs based on a given input prompt.  
Unlike chat models, these do **not** follow the multi-message chat structure — they simply take a prompt and return
generated text. *(In theory, you could do multi-turn conversation if you knew how to format the prompt correctly.)*

### Supported Text Generation Models

<!-- <autogen readme-tg-models> -->
<!-- ⚠️ WARNING: This section that is marked by the autogen ID of readme-tg-models (top and bottom) is auto-generated. -->
<!-- Do not edit manually. -->
<!-- Generated on: 2025-04-27T15:47:14.667Z -->
<!-- Description: Text generation models tables -->

| ID                                         | Provider |
|--------------------------------------------|----------|
| `elyza/elyza-japanese-llama-2-7b-instruct` | ELYZA    |
| `google/flan-t5-xl`                        | Google   |
| `google/flan-t5-xxl`                       | Google   |
| `google/flan-ul2`                          | Google   |
| `ibm/granite-13b-instruct-v2`              | IBM      |

<!-- </autogen readme-tg-models> -->

### Usage Example

```ts
import {generateText} from 'ai';

// Simple creative writing prompt
const {text} = await generateText({
    model: watsonx.languageModel('google/flan-t5-xxl'),
    prompt: 'Invent a new ice cream flavor inspired by a magical forest.',
});

// 'text' will contain a whimsical, imaginative ice cream description
```