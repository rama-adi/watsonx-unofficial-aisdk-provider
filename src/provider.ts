import type {EmbeddingModelV1, LanguageModelV1, ProviderV1} from "@ai-sdk/provider";
import type {WatsonxChatModelId, WatsonxChatSetting, WatsonxEmbeddingModelId} from "./types/watsonx-settings";
import {
    loadApiKey,
    loadOptionalSetting,
    loadSetting,
    withoutTrailingSlash,
    type FetchFunction
} from "@ai-sdk/provider-utils";
import {WatsonxChatLanguageModel} from "./models/chat-models/watsonx-chat-language-model.ts";
import {WatsonxEmbeddingModel} from "./models/embedding-models/watsonx-embedding-model.ts";
import type {WatsonxEmbeddingSetting} from "./models/embedding-models/watsonx-embedding-model-settings.ts";

export interface WatsonxProvider extends ProviderV1 {
    /*
     * Creates a new WatsonxChatLanguageModel instance with the specified model ID and optional settings.
     * This is the default function call syntax for the provider.
     */
    (modelId: WatsonxChatModelId, settings?: WatsonxChatSetting): WatsonxChatLanguageModel;

    /*
     * Creates a new WatsonxChatLanguageModel instance with the specified model ID and optional settings.
     * This is equivalent to calling the provider directly.
     */
    languageModel(modelId: WatsonxChatModelId, settings?: WatsonxChatSetting): WatsonxChatLanguageModel;

    /*
     * Creates a new WatsonxChatLanguageModel instance with the specified model ID and optional settings.
     * This is an alias for languageModel() to maintain compatibility with chat-focused interfaces.
     */
    chat(modelId: WatsonxChatModelId, settings?: WatsonxChatSetting): WatsonxChatLanguageModel;

    /*
     * Creates a new WatsonxEmbeddingModel instance with the specified model ID and optional settings.
     */
    embedding(modelId: WatsonxEmbeddingModelId, settings?: WatsonxEmbeddingSetting): EmbeddingModelV1<string>;

    textEmbeddingModel(modelId: WatsonxEmbeddingModelId, settings?: WatsonxEmbeddingSetting): EmbeddingModelV1<string>;

    textEmbedding(modelId: WatsonxEmbeddingModelId, settings?: WatsonxEmbeddingSetting): EmbeddingModelV1<string>;
}

export interface WatsonxProviderSetting {
    /**
     The cluster which you host your watsonx ai project

     This uses the default IBM watsonx API URL (which is: https://{cluster url}.ml.cloud.ibm.com).

     Of course, you can always override it in clusterURL
     */
    cluster?: "ca-tor" | "jp-tok" | "eu-gb" | "eu-de" | "us-south" | "au-syd";

    /**
     The Project ID that hosts your watsonx model

     Find it in the GUI here: https://{cluster}.dataplatform.cloud.ibm.com/projects/?context=wx click on your project > manage

     Of course, you can always override it in clusterURL
     */
    projectID?: string;

    /**
     Custom cluster URL
     */
    clusterURL?: string;

    /**
     Bearer token that is being send using the `Authorization` header.
     It defaults to the `MISTRAL_API_KEY` environment variable.

     The easiest way to obtain this token:

     https://cloud.ibm.com/docs/account?topic=account-iamtoken_from_apikey#iamtoken_from_apikey

     or via this cURL command:
     `curl -X POST 'https://iam.cloud.ibm.com/identity/token' -H 'Content-Type: application/x-www-form-urlencoded' -d 'grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=MY_APIKEY'`
     */
    bearerToken?: string;

    /**
     Custom headers to include in the requests.
     */
    headers?: Record<string, string>;

    /**
     Custom fetch implementation. You can use it as a middleware to intercept requests,
     or to provide a custom fetch implementation for e.g. testing.
     */
    fetch?: FetchFunction;
}


export function createWatsonx(
    options: WatsonxProviderSetting = {},
): WatsonxProvider {

    const clusterURL = loadOptionalSetting({
        settingValue: options.clusterURL,
        environmentVariableName: "WATSONX_CLUSTER_URL"
    }) ?? (() => {
        const cluster = loadSetting({
            settingValue: options.cluster,
            settingName: "cluster",
            environmentVariableName: "WATSONX_CLUSTER",
            description: "The IBM watsonx Cluster"
        });
        return `${withoutTrailingSlash(`https://${cluster}.ml.cloud.ibm.com`)}/ml/v1`;
    })();

    const projectID = loadSetting({
        settingValue: options.projectID,
        settingName: "projectID",
        environmentVariableName: "WATSONX_PROJECT_ID",
        description: "The IBM watsonx Project ID"
    })

    const getHeaders = () => ({
        Authorization: `Bearer ${loadApiKey({
            apiKey: options.bearerToken,
            environmentVariableName: 'WATSONX_BEARER_TOKEN',
            description: 'Watsonx',
        })}`,
        ...options.headers,
    });

    const createChatModel = (
        modelId: WatsonxChatModelId,
        settings: WatsonxChatSetting = {},
    ) => new WatsonxChatLanguageModel(modelId, settings, {
        provider: 'watsonx.chat',
        clusterURL,
        projectID,
        headers: getHeaders,
        fetch: options.fetch,
        version: '2024-02-13'
    });

    const createEmbeddingModel = (
        modelId: WatsonxEmbeddingModelId,
        settings: WatsonxEmbeddingSetting = {},
    ) => new WatsonxEmbeddingModel(modelId, settings, {
        provider: 'watsonx.embedding',
        clusterURL,
        projectID,
        headers: getHeaders,
        fetch: options.fetch,
        version: '2024-02-13'
    });

    const provider = function (
        modelId: WatsonxChatModelId,
        settings?: WatsonxChatSetting,
    ) {
        if (new.target) {
            throw new Error(
                'The watsonx model function cannot be called with the new keyword.',
            );
        }

        return createChatModel(modelId, settings);
    };

    provider.languageModel = (modelId: WatsonxEmbeddingModelId, settings?: WatsonxChatSetting) => createChatModel(modelId, settings);
    provider.chat = (modelId: WatsonxEmbeddingModelId, settings?: WatsonxChatSetting) => createChatModel(modelId, settings);
    provider.embedding = (modelId: WatsonxEmbeddingModelId, settings?: WatsonxEmbeddingSetting) => createEmbeddingModel(modelId, settings);
    provider.textEmbeddingModel = (modelId: WatsonxEmbeddingModelId, settings?: WatsonxEmbeddingSetting) => createEmbeddingModel(modelId, settings);
    provider.textEmbedding = (modelId: WatsonxEmbeddingModelId, settings?: WatsonxEmbeddingSetting) => createEmbeddingModel(modelId, settings);

    return provider;
}
