import type { EmbeddingModelV2, ProviderV2 } from '@ai-sdk/provider';
import {
  loadApiKey,
  loadOptionalSetting,
  loadSetting,
  withoutTrailingSlash,
  type FetchFunction,
} from '@ai-sdk/provider-utils';
import { WatsonxChatModel } from './models/chat-models/watsonx-chat-model.ts';
import { WatsonxEmbeddingModel } from './models/embedding-models/watsonx-embedding-model.ts';
import type {
  WatsonxEmbeddingModelId,
  WatsonxEmbeddingModelIdFor,
  WatsonxEmbeddingSetting,
} from './models/embedding-models/watsonx-embedding-model-settings.ts';
import type {
  WatsonxChatModelId,
  WatsonxChatModelIdFor,
  WatsonxChatSetting,
} from './models/chat-models/watsonx-chat-model-settings.ts';
import { WatsonxCompletionModel } from './models/completion-models/watsonx-completion-model.ts';
import type {
  WatsonxCompletionModelId,
  WatsonxCompletionModelIdFor,
  WatsonxCompletionSetting,
} from './models/completion-models/watsonx-completion-model-settings.ts';
import type { WatsonxCluster } from './types/watsonx-common-schema.ts';

export interface WatsonxProvider<C extends WatsonxCluster = WatsonxCluster>
  extends ProviderV2 {
  /*
   * Creates a new WatsonxChatLanguageModel instance with the specified model ID and optional settings.
   * This is the default function call syntax for the provider.
   */
  (
    modelId: WatsonxChatModelIdFor<C>,
    settings?: WatsonxChatSetting,
  ): WatsonxChatModel;

  /*
   * Creates a new WatsonxChatLanguageModel instance with the specified model ID and optional settings.
   * This is equivalent to calling the provider directly.
   */
  languageModel(
    modelId: WatsonxChatModelIdFor<C>,
    settings?: WatsonxChatSetting,
  ): WatsonxChatModel;

  /*
   * Creates a new WatsonxEmbeddingModel instance with the specified model ID and optional settings.
   */
  embedding(
    modelId: WatsonxEmbeddingModelIdFor<C>,
    settings?: WatsonxEmbeddingSetting,
  ): EmbeddingModelV2<string>;

  completion(
    modelId: WatsonxCompletionModelIdFor<C>,
    settings?: WatsonxCompletionSetting,
  ): WatsonxCompletionModel;

  textEmbeddingModel(
    modelId: WatsonxEmbeddingModelIdFor<C>,
    settings?: WatsonxEmbeddingSetting,
  ): EmbeddingModelV2<string>;

  textEmbedding(
    modelId: WatsonxEmbeddingModelIdFor<C>,
    settings?: WatsonxEmbeddingSetting,
  ): EmbeddingModelV2<string>;
}

export interface WatsonxProviderSetting<C extends WatsonxCluster = WatsonxCluster> {
  /**
     The cluster which you host your watsonx AI project

     This uses the default IBM watsonx API URL (which is: https://{cluster url}.ml.cloud.ibm.com).

     Of course, you can always override it in clusterURL
     */
  cluster?: C;

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

export function createWatsonx<C extends WatsonxCluster = WatsonxCluster>(
  options: WatsonxProviderSetting<C> = {},
): WatsonxProvider<C> {
  const clusterURL =
    loadOptionalSetting({
      settingValue: options.clusterURL,
      environmentVariableName: 'WATSONX_CLUSTER_URL',
    }) ??
    (() => {
      const cluster = loadSetting({
        settingValue: options.cluster,
        settingName: 'cluster',
        environmentVariableName: 'WATSONX_CLUSTER',
        description: 'The IBM watsonx Cluster',
      });
      return `${withoutTrailingSlash(`https://${cluster}.ml.cloud.ibm.com`)}/ml/v1`;
    })();

  const projectID = loadSetting({
    settingValue: options.projectID,
    settingName: 'projectID',
    environmentVariableName: 'WATSONX_PROJECT_ID',
    description: 'The IBM watsonx Project ID',
  });

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
  ) =>
    new WatsonxChatModel(modelId, settings, {
      provider: 'watsonx.chat',
      clusterURL,
      projectID,
      headers: getHeaders,
      fetch: options.fetch,
      version: '2024-02-13',
    });

  const createEmbeddingModel = (
    modelId: WatsonxEmbeddingModelId,
    settings: WatsonxEmbeddingSetting = {},
  ) =>
    new WatsonxEmbeddingModel(modelId, settings, {
      provider: 'watsonx.embedding',
      clusterURL,
      projectID,
      headers: getHeaders,
      fetch: options.fetch,
      version: '2024-02-13',
    });

  const createCompletionModel = (
    modelId: WatsonxCompletionModelId,
    settings: WatsonxCompletionSetting = {},
  ) =>
    new WatsonxCompletionModel(modelId, settings, {
      provider: 'watsonx.completion',
      clusterURL,
      projectID,
      headers: getHeaders,
      fetch: options.fetch,
      version: '2024-02-13',
    });

  const provider = function (
    modelId: WatsonxChatModelIdFor<C>,
    settings?: WatsonxChatSetting,
  ) {
    if (new.target) {
      throw new Error(
        'The watsonx model function cannot be called with the new keyword.',
      );
    }

    return createChatModel(modelId, settings);
  };

  provider.languageModel = (
    modelId: WatsonxChatModelIdFor<C>,
    settings?: WatsonxChatSetting,
  ) => createChatModel(modelId, settings);
  provider.embedding = (
    modelId: WatsonxEmbeddingModelIdFor<C>,
    settings?: WatsonxEmbeddingSetting,
  ) => createEmbeddingModel(modelId, settings);
  provider.textEmbeddingModel = (
    modelId: WatsonxEmbeddingModelIdFor<C>,
    settings?: WatsonxEmbeddingSetting,
  ) => createEmbeddingModel(modelId, settings);
  provider.textEmbedding = (
    modelId: WatsonxEmbeddingModelIdFor<C>,
    settings?: WatsonxEmbeddingSetting,
  ) => createEmbeddingModel(modelId, settings);
  provider.completion = (
    modelId: WatsonxCompletionModelIdFor<C>,
    settings?: WatsonxCompletionSetting,
  ) => createCompletionModel(modelId, settings);

  // Required by ProviderV2 interface but not supported by watsonx
  provider.imageModel = () => {
    throw new Error('Image models are not supported by watsonx provider');
  };

  return provider as unknown as WatsonxProvider<C>;
}

export const watsonx = createWatsonx();
