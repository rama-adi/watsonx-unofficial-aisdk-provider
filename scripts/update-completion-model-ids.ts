import type { APIResponse } from './index.ts';
import { readCodegenFile, writeCodegenContent } from './write-codegen-content.ts';
import { createCodegen } from './create-codegen.ts';

export async function updateCompletionModelIds(models: APIResponse) {
  const PATH = 'models/completion-models/watsonx-completion-model-settings.ts';

  const completionModels = models.resources
    .filter(
      (resource) =>
        !resource.lifecycle.some((lifecycle) => lifecycle.id === 'deprecated'),
    )
    .filter(
      (resource) =>
        resource.functions.some((res) => res.id === 'text_generation') &&
        !resource.functions.some((res) => res.id === 'text_chat'),
    )
    .flatMap((resource) => `'${resource.model_id}'`)
    .join(',\n');

  const oldContent = await readCodegenFile(PATH);
  const settingsAutogen = createCodegen({
    base: oldContent,
    id: 'watsonx-completion-model-ids',
    markerType: 'js',
    description:
      'All of the supported completion models fetched from watsonx API. This only take account non-deprecated models.',
    content: [
      '// Models here can be called from the /chat endpoint',
      '// and supports the `CoreMessage[]` type',
      'export const CompletionModelLists = [',
      completionModels,
      '] as const',
      '',

      '// Type generated from the array',
      'export type WatsonxCompletionModelId =',
      '  | (typeof CompletionModelLists[number])',
      '  | (string & {})',
      '',
    ],
    append: '\n',
  });

  await writeCodegenContent({
    filePath: PATH,
    content: settingsAutogen,
  });
}
