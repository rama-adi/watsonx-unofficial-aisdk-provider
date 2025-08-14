import type { APIResponse } from './index.ts';
import { createCodegen } from './create-codegen.ts';
import {
  readCodegenFile,
  writeCodegenContent,
} from './write-codegen-content.ts';

export async function updateEmbeddingModelIds(
  modelsByRegion: Record<string, APIResponse>,
) {
  const PATH = 'models/embedding-models/watsonx-embedding-model-settings.ts';

  const regions = Object.keys(modelsByRegion);

  const toArrayString = (models: string[]) =>
    models.map((m) => `    '${m}'`).join(',\n');

  const buildRegionMapString = () => {
    const lines: string[] = [];
    for (const region of regions) {
      const response = modelsByRegion[region]!;
      const resources = Array.isArray((response as any)?.resources)
        ? ((response as any).resources as APIResponse['resources'])
        : [];
      const ids = resources
        .filter(
          (resource) =>
            !(resource.lifecycle ?? []).some(
              (lifecycle) => lifecycle.id === 'deprecated',
            ),
        )
        .filter((resource) =>
          (resource.functions ?? []).some((res) => res.id === 'embedding'),
        )
        .map((resource) => resource.model_id);

      lines.push(`  "${region}": [\n${toArrayString(ids)}\n  ]`);
    }
    return lines.join(',\n');
  };

  const embeddingModelsByRegion = buildRegionMapString();

  const oldContent = await readCodegenFile(PATH);
  const settingsAutogen = createCodegen({
    base: oldContent,
    id: 'watsonx-embedding-model-ids',
    markerType: 'js',
    description:
      'All of the supported embedding models fetched from watsonx API by region. Only non-deprecated models are included.',
    content: [
      '// Models here can be called from the /chat endpoint',
      '// and supports the `CoreMessage[]` type',
      'export const EmbedingModelLists = {',
      embeddingModelsByRegion,
      '} as const;',
      '',
      'export type WatsonxEmbeddingRegion = keyof typeof EmbedingModelLists;',
      '',
      '// Type generated from the object',
      'export type WatsonxEmbeddingModelId =',
      '  | (typeof EmbedingModelLists)[WatsonxEmbeddingRegion][number]',
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
