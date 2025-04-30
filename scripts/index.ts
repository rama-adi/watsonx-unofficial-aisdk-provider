import { updateChatModelIds } from './update-chat-model-ids.ts';
import { updateEmbeddingModelIds } from './update-embedding-model-ids.ts';
import { updateSupportedModelsFile } from './update-supported-models-file.ts';
import { updateCompletionModelIds } from './update-completion-model-ids.ts';

namespace RESPONSE {
  export interface Root {
    total_count: number;
    limit: number;
    first: First;
    resources: Resource[];
  }

  export interface First {
    href: string;
  }

  export interface Resource {
    model_id: string;
    label: string;
    provider: string;
    source: string;
    functions: Function[];
    short_description: string;
    long_description: string;
    input_tier: string;
    output_tier: string;
    number_params: string;
    limits: Limits;
    lifecycle: Lifecycle[];
    terms_url?: string;
    min_shot_size?: number;
    task_ids?: string[];
    tasks?: Task[];
    model_limits?: ModelLimits;
    training_parameters?: TrainingParameters2;
    versions?: Version[];
    supported_languages?: string[];
  }

  export interface Function {
    id: string;
  }

  export interface Limits {
    lite: Lite;
    'v2-professional': V2Professional;
    'v2-standard': V2Standard;
  }

  export interface Lite {
    call_time: string;
    max_output_tokens?: number;
  }

  export interface V2Professional {
    call_time: string;
    max_output_tokens?: number;
  }

  export interface V2Standard {
    call_time: string;
    max_output_tokens?: number;
  }

  export interface Lifecycle {
    id: string;
    start_date: string;
    alternative_model_ids?: string[];
  }

  export interface Task {
    id: string;
    tags?: string[];
    ratings?: Ratings;
    training_parameters?: TrainingParameters;
  }

  export interface Ratings {
    quality: number;
  }

  export interface TrainingParameters {
    init_method: InitMethod;
    init_text: InitText;
    num_virtual_tokens: NumVirtualTokens;
    num_epochs: NumEpochs;
    verbalizer: Verbalizer;
    batch_size: BatchSize;
    max_input_tokens: MaxInputTokens;
    max_output_tokens: MaxOutputTokens;
    torch_dtype: TorchDtype;
    accumulate_steps: AccumulateSteps;
    learning_rate: LearningRate;
  }

  export interface InitMethod {
    supported: string[];
    default: string;
  }

  export interface InitText {
    default: string;
  }

  export interface NumVirtualTokens {
    supported: number[];
    default: number;
  }

  export interface NumEpochs {
    default: number;
    min: number;
    max: number;
  }

  export interface Verbalizer {
    default: string;
  }

  export interface BatchSize {
    default: number;
    min: number;
    max: number;
  }

  export interface MaxInputTokens {
    default: number;
    min: number;
    max: number;
  }

  export interface MaxOutputTokens {
    default: number;
    min: number;
    max: number;
  }

  export interface TorchDtype {
    default: string;
  }

  export interface AccumulateSteps {
    default: number;
    min: number;
    max: number;
  }

  export interface LearningRate {
    default: number;
    min: number;
    max: number;
  }

  export interface ModelLimits {
    max_sequence_length: number;
    embedding_dimension?: number;
    max_output_tokens?: number;
    training_data_max_records?: number;
  }

  export interface TrainingParameters2 {
    init_method: InitMethod2;
    init_text: InitText2;
    num_virtual_tokens: NumVirtualTokens2;
    num_epochs: NumEpochs2;
    verbalizer: Verbalizer2;
    batch_size: BatchSize2;
    max_input_tokens: MaxInputTokens2;
    max_output_tokens: MaxOutputTokens2;
    torch_dtype: TorchDtype2;
    accumulate_steps: AccumulateSteps2;
    learning_rate: LearningRate2;
  }

  export interface InitMethod2 {
    supported: string[];
    default: string;
  }

  export interface InitText2 {
    default: string;
  }

  export interface NumVirtualTokens2 {
    supported: number[];
    default: number;
  }

  export interface NumEpochs2 {
    default: number;
    min: number;
    max: number;
  }

  export interface Verbalizer2 {
    default: string;
  }

  export interface BatchSize2 {
    default: number;
    min: number;
    max: number;
  }

  export interface MaxInputTokens2 {
    default: number;
    min: number;
    max: number;
  }

  export interface MaxOutputTokens2 {
    default: number;
    min: number;
    max: number;
  }

  export interface TorchDtype2 {
    default: string;
  }

  export interface AccumulateSteps2 {
    default: number;
    min: number;
    max: number;
  }

  export interface LearningRate2 {
    default: number;
    min: number;
    max: number;
  }

  export interface Version {
    version: string;
    available_date: string;
  }
}
export type APIResponse = RESPONSE.Root;

async function main() {
  const result = await fetch(
    'https://jp-tok.ml.cloud.ibm.com/ml/v1/foundation_model_specs?version=2024-10-10',
  );
  const response = (await result.json()) as APIResponse;

  await updateChatModelIds(response);
  await updateEmbeddingModelIds(response);
  await updateSupportedModelsFile(response);
  await updateCompletionModelIds(response);

  // Run formatting script after all updates are complete
  const { execSync } = require('child_process');
  execSync('cd .. && npm run format', { stdio: 'inherit' });
}

main();
