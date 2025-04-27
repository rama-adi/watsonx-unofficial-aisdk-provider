# Unofficial watsonx.ai Provider for AI SDK
> ⚠️ **Warning**: This SDK is experimental and primarily developed for personal use. APIs and functionality may change at any time without notice. It is not an official product and is not supported by IBM. Use at your own risk, particularly in production environments.

The **watsonx.ai provider** for the [AI SDK](https://sdk.vercel.ai/docs) makes it easy to tap into IBM’s powerful and diverse watsonx.ai foundation models, all through the AI SDK’s familiar, standardized interface.  

Built as an **unofficial adapter**, it’s perfect for teams looking to **drop IBM models straight into existing AI SDK projects** or **kick off new builds with watsonx.ai** from day one.  

This project started while I was working on an IBM SkillsBuild project. I needed a clean way to integrate watsonx models into my TypeScript app, and I loved the developer experience of Vercel's AI SDK. Building my own adapter felt like the best way to learn the watsonx APIs while making something genuinely useful for the community. So if you're already familiar with the AI SDK and wanted to take advantage of watsonx foundational models, this SDK is a good fit!

## Installation

Install the provider with:

```bash
npm install @rama-adi/watsonx-unofficial-aisdk-provider
```

## Supported functionality

- ✅ Chat generation
- ✅ Structured output
- ✅ Streaming response
- ✅ Tool calling (YMMV depending on the model)

## Examples

I have provided some sample implementations in the `demos` folder.

## Requirements

Before getting started, make sure you have:
- An IBM Cloud account with watsonx.ai access
- An API key from IBM Cloud
- A Project ID from your watsonx.ai workspace

## Quick start

```ts
import { createWatsonx } from '@rama-adi/watsonx-unofficial-aisdk-provider';
import { generateText } from 'ai';

// Initialize with your IBM Cloud credentials
const watsonxInstance = createWatsonx({
  cluster: "us-south", // Example: "ca-tor", "jp-tok", "eu-gb", "eu-de", "au-syd" are also available
  projectID: "your-project-id", // Found in your watsonx.ai project settings
  bearerToken: "your-bearer-token" // Obtain via IBM Cloud IAM
});

// Generate text using the Granite model
const { text } = await generateText({
  model: watsonxInstance('ibm/granite-3-8b-instruct'),
  prompt: 'Translate "Hello" to French:',
});
```

## Getting a Bearer Token

This provider **requires** a bearer token. It does not handle token generation for you. You can get a token by:

- Using the IBM Cloud Node.js SDK:

```bash
npm install ibm-cloud-sdk-core
```

```ts
import { IamAuthenticator } from 'ibm-cloud-sdk-core';

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

## Supported Models

Currently supported models:
<!-- <autogen watsonx-supported-models> -->
<!-- ⚠️ WARNING: This section that is marked by the autogen ID of watsonx-supported-models (top and bottom) is auto-generated. -->
<!-- Do not edit manually. -->
<!-- Generated on: 2025-04-27T06:48:47.986Z -->
<!-- Description: All of the supported models fetched from watsonx API. This only take account non-deprecated models. -->

### Chat Models: 

| ID | Provider | Function Calling & Structured Outputs |
|----|----------|---------------------------------------|
| `ibm/granite-3-2b-instruct` | IBM | ✅ |
| `ibm/granite-3-8b-instruct` | IBM | ✅ |
| `meta-llama/llama-3-2-11b-vision-instruct` | Meta | ✅ |
| `meta-llama/llama-3-3-70b-instruct` | Meta | ✅ |
| `meta-llama/llama-guard-3-11b-vision` | Meta | ❌ |
| `mistralai/mixtral-8x7b-instruct-v01` | Mistral AI | ❌ |

> *Structured output sends a function that's force-run to generate the expected schema output. It requires model that supports function calling.*

### Embedding Models: 

| ID | Provider | Max Sequence Length | Embedding Dimensions |
|----|----------|---------------------|----------------------|
| `ibm/granite-embedding-107m-multilingual` | IBM | 512 | 384
| `ibm/granite-embedding-278m-multilingual` | IBM | 512 | 768
| `ibm/slate-125m-english-rtrvr` | IBM | 512 | 768
| `ibm/slate-125m-english-rtrvr-v2` | IBM | 512 | 768
| `ibm/slate-30m-english-rtrvr` | IBM | 512 | 384
| `ibm/slate-30m-english-rtrvr-v2` | IBM | 512 | 384
| `intfloat/multilingual-e5-large` | intfloat | 512 | 1024
| `sentence-transformers/all-minilm-l12-v2` | sentence-transformers | 128 | 384
| `sentence-transformers/all-minilm-l6-v2` | sentence-transformers | 256 | 384

### Text generation Models: 
This model does not use the chat endpoint, as such `CoreMessage[]` type is not supported. You have to send the appropriate tokens yourself.

| ID | Provider |
|----|----------|
| `elyza/elyza-japanese-llama-2-7b-instruct` | ELYZA |
| `google/flan-t5-xl` | Google |
| `google/flan-t5-xxl` | Google |
| `google/flan-ul2` | Google |
| `ibm/granite-13b-instruct-v2` | IBM |
<!-- </autogen watsonx-supported-models> -->

## What's Next
Ready to build? Check out the [AI SDK Documentation](https://sdk.vercel.ai/docs/introduction) and start integrating generative AI into your apps today.


## Known Limitations

- This is **not** an official IBM product. If you encounter any issues while using this adapter, please open an issue in this repository — they are likely related to this implementation, not IBM's services.
- Rate limits and quotas are determined by your IBM Cloud subscription.
- Some advanced watsonx.ai features may not be supported yet.

## Contributing

Contributions are not just welcome — they’re needed! This is a one-person project focused on integrating watsonx.ai APIs, and there’s still plenty of room for improvements, additional functionality, and better testing.  

If you have ideas, feedback, or a Pull Request to offer, please don't hesitate — your contributions are greatly appreciated!

## License

Apache 2.0 License.

---

> *Disclaimer: This project is not affiliated with or endorsed by IBM. watsonx.ai is a trademark of IBM.*