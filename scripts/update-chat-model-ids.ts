import type { APIResponse } from './index.ts';
import { readCodegenFile, writeCodegenContent } from './write-codegen-content.ts';
import { createCodegen } from './create-codegen.ts';

export async function updateChatModelIds(models: APIResponse) {
  const PATH = 'models/chat-models/watsonx-chat-model-settings.ts';

  const chatModel = models.resources
    .filter(
      (resource) =>
        !resource.lifecycle.some((lifecycle) => lifecycle.id === 'deprecated'),
    )
    .filter((resource) =>
      resource.functions.some((res) => res.id === 'text_chat'),
    )
    .flatMap((resource) => `    '${resource.model_id}'`)
    .join(',\n  ');

  const visionModel = models.resources
    .filter(
      (resource) =>
        !resource.lifecycle.some((lifecycle) => lifecycle.id === 'deprecated'),
    )
    .filter((resource) =>
      resource.functions.some((res) => res.id === 'image_chat'),
    )
    .flatMap((resource) => `'${resource.model_id}'`)
    .join(',\n');

  const fnCallingModels = models.resources
    .filter(
      (resource) =>
        !resource.lifecycle.some((lifecycle) => lifecycle.id === 'deprecated'),
    )
    .filter((resource) =>
      resource.functions.some((res) => res.id === 'text_chat'),
    )
    .filter((resource) => resource.task_ids?.includes('function_calling'))
    .flatMap((resource) => `'${resource.model_id}'`)
    .join(',\n');

  const oldContent = await readCodegenFile(PATH);
  const settingsAutogen = createCodegen({
    base: oldContent,
    id: 'watsonx-chat-model-ids',
    markerType: 'js',
    description:
      'All of the supported models fetched from watsonx API. This only take account non-deprecated models.',
    content: [
      '// Models here can be called from the /chat endpoint',
      '// and supports the `CoreMessage[]` type',
      'export const ChatModelLists = [',
      chatModel,
      '] as const;',
      '',

      '// Type generated from the array',
      'export type WatsonxChatModelId =',
      '  | (typeof ChatModelLists[number])',
      '  | (string & {});',
      '',

      '// Vision model',
      'export const VisionModelLists = [',
      visionModel,
      '] as const;',
      '',

      '// Function calling model',
      'export const FunctionCallingModelLists = [',
      fnCallingModels,
      '] as const;',
    ],
    append: '\n',
  });

  await writeCodegenContent({
    filePath: PATH,
    content: settingsAutogen,
  });
}
