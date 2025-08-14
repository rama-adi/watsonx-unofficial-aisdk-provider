# Unofficial watsonx.ai Provider for Vercel AI SDK

The easiest way to use IBM watsonx.ai models with the familiar [AI SDK](https://sdk.vercel.ai/docs) interface.

Run Granite, Llama, and more with a clean, minimal setup—no custom clients required.

> [!WARNING]
> Experimental and community-maintained. Not an official IBM product. APIs can change without notice.

> [!NOTE]
> On AI SDK v4? Install `0.0.1-alpha.1`. Version `0.0.2-alpha.1` targets AI SDK v5 (`ProviderV2`) and is breaking.

## Why use this?

- **Familiar DX**: Plug into the AI SDK you already know (`generateText`, `streamText`, `embed`).
- **Watsonx-ready**: Works with IBM’s hosted models using your project and cluster.
- **Zero fuss**: Configure via function args or environment variables.

## Installation

Install the provider with:

```bash
npm install @rama-adi/watsonx-unofficial-ai-provider
```

Peer requirements:

- ai: ^5.0.0
- node: >=18

## What you get

- ✅ Chat generation
- ✅ Structured output
- ✅ Streaming response
- ✅ Tool calling (model dependent)
- ✅ Embeddings

## Prerequisites

- IBM Cloud account with watsonx.ai access
- IBM Cloud API key (to request a Bearer token)
- watsonx.ai Project ID

## Quick start

```ts
import {createWatsonx} from '@rama-adi/watsonx-unofficial-ai-provider';
import {generateText} from 'ai';

// Initialize with your IBM Cloud credentials
const watsonxInstance = createWatsonx({
    cluster: "us-south", // Example: "ca-tor", "jp-tok", "eu-gb", "eu-de", "au-syd" are also available
    projectID: "your-project-id", // Found in your watsonx.ai project settings
    bearerToken: "your-bearer-token" // Obtain via IBM Cloud IAM
});

// Generate text using the Granite model
const {text} = await generateText({
    model: watsonxInstance('ibm/granite-3-8b-instruct'),
    prompt: 'Translate "Hello" to French:',
});
```

### Streaming

```ts
import {streamText} from 'ai';

const stream = await streamText({
  model: watsonxInstance('ibm/granite-3-8b-instruct'),
  prompt: 'Write a haiku about spring rain.',
});

for await (const delta of stream.textStream) {
  process.stdout.write(delta);
}
```

### Embeddings

```ts
import {embed} from 'ai';

const result = await embed({
  model: watsonxInstance.textEmbeddingModel('ibm/granite-3-8b-instruct'),
  values: [
    'Lighthouses are used to guide ships at sea.',
    'Machine learning enables computers to learn from data.',
  ],
});

console.log(result.embeddings[0].length);
```

## Getting a Bearer Token

This provider **requires** a bearer token. It does not handle token generation for you. You can get a token by:

- Using the IBM Cloud Node.js SDK:

```bash
npm install ibm-cloud-sdk-core
```

```ts
import {IamAuthenticator} from 'ibm-cloud-sdk-core';

const authenticator = new IamAuthenticator({
    apikey: '{your-apikey}',
});
```

- Or by manually requesting it via cURL:

```bash
curl -X POST 'https://iam.cloud.ibm.com/identity/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=YOUR_APIKEY'
```

## Configuration

You can pass options directly to `createWatsonx(...)` or configure via environment variables.

- `cluster` (or `clusterURL`):
  - `WATSONX_CLUSTER` or `WATSONX_CLUSTER_URL`
  - Example cluster values: `ca-tor`, `jp-tok`, `eu-gb`, `eu-de`, `us-south`, `au-syd`
- `projectID`:
  - `WATSONX_PROJECT_ID`
- `bearerToken`:
  - `WATSONX_BEARER_TOKEN`

Example using environment variables only:

```ts
import {createWatsonx} from '@rama-adi/watsonx-unofficial-ai-provider';

// Assumes WATSONX_CLUSTER or WATSONX_CLUSTER_URL, WATSONX_PROJECT_ID, WATSONX_BEARER_TOKEN are set
const watsonxInstance = createWatsonx();
```

## Pick a model

Browse the [Supported Models](supported-models.md) or import lists directly:

```ts
import {
  ChatModelLists,
  FunctionCallingModelLists,
  VisionModelLists,
} from '@rama-adi/watsonx-unofficial-ai-provider';

// Example: use the first chat-capable model in a region
const modelId = ChatModelLists['us-south'][0];
```

## API at a glance

- `createWatsonx(options)` → returns a provider instance
  - Call directly for chat: `watsonxInstance(modelId, settings?)`
  - `languageModel(modelId, settings?)` → chat model
  - `embedding(modelId, settings?)` → embeddings
  - `textEmbeddingModel(modelId, settings?)` / `textEmbedding(modelId, settings?)` → embeddings (aliases)
  - `completion(modelId, settings?)` → completion (depends on available models)

## Supported Models

Check out the [Supported Models](supported-models.md) page for a list of all the models you can use with this provider.

You can also import the lists directly:

```ts
import {
  ChatModelLists,
  FunctionCallingModelLists,
  VisionModelLists,
} from '@rama-adi/watsonx-unofficial-ai-provider';
```

## Troubleshooting

- **Missing Project ID or Cluster**: Ensure `WATSONX_PROJECT_ID` and `WATSONX_CLUSTER` (or `WATSONX_CLUSTER_URL`) are set.
- **401 Unauthorized**: Your Bearer token may be invalid or expired—request a fresh one.
- **404 or Network errors**: Verify the cluster region (e.g., `us-south`) and your project’s region.

## What's Next

Ready to build? Check out the [AI SDK Documentation](https://sdk.vercel.ai/docs/introduction) and start integrating
generative AI into your apps today.

## Known Limitations

- This is **not** an official IBM product. If you encounter any issues while using this adapter, please open an issue in
  this repository — they are likely related to this implementation, not IBM's services.
- Rate limits and quotas are determined by your IBM Cloud subscription.
- Some advanced watsonx.ai features may not be supported yet.
- Image generation models are not supported.

## Contributing

Contributions are not just welcome — they’re needed! This is a one-person project focused on integrating watsonx.ai
APIs, and there’s still plenty of room for improvements, additional functionality, and better testing.

If you have ideas, feedback, or a Pull Request to offer, please don't hesitate — your contributions are greatly
appreciated!

## License

Apache 2.0 License.

---

> *Disclaimer: This project is not affiliated with or endorsed by IBM. watsonx.ai is a trademark of IBM.*