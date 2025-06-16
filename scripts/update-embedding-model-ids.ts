import type { APIResponse } from './index.ts';
import { createCodegen } from './create-codegen.ts';
import {
  readCodegenFile,
  writeCodegenContent,
} from './write-codegen-content.ts';

export async function updateEmbeddingModelIds(models: APIResponse) {
  const PATH = 'models/embedding-models/watsonx-embedding-model-settings.ts';
  const embeddingModels = models.resources
    .filter(
      (resource) =>
        !resource.lifecycle.some((lifecycle) => lifecycle.id === 'deprecated'),
    )
    .filter((resource) =>
      resource.functions.some((res) => res.id === 'text_chat'),
    )
    .flatMap((resource) => `'${resource.model_id}'`)
    .join(',\n');

  const oldContent = await readCodegenFile(PATH);
  const settingsAutogen = createCodegen({
    base: oldContent,
    id: 'watsonx-embedding-model-ids',
    markerType: 'js',
    description:
      'All of the supported embedding models fetched from watsonx API. This only take account non-deprecated models.',
    content: [
      '// Models here can be called from the /chat endpoint',
      '// and supports the `CoreMessage[]` type',
      'export const EmbedingModelLists = [',
      embeddingModels,
      '] as const;',
      '',

      '// Type generated from the array',
      'export type WatsonxEmbeddingModelId =',
      '  | (typeof EmbedingModelLists[number])',
      '  | (string & {});',
      '',
    ],
    append: '\n',
  });

  await writeCodegenContent({
    filePath: PATH,
    content: settingsAutogen,
  });
}
