import type { APIResponse } from './index.ts';
import {
  readCodegenFile,
  writeCodegenContent,
} from './write-codegen-content.ts';
import { createCodegen } from './create-codegen.ts';

export async function updateChatModelIds(
  modelsByRegion: Record<string, APIResponse>,
) {
  const PATH = 'models/chat-models/watsonx-chat-model-settings.ts';

  const regions = Object.keys(modelsByRegion);

  const toArrayString = (models: string[]) =>
    models.map((m) => `    '${m}'`).join(',\n');

  const buildRegionMapString = (
    mapper: (res: APIResponse['resources'][number]) => boolean,
  ) => {
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
        .filter((resource) => mapper(resource))
        .map((resource) => resource.model_id);

      lines.push(`  "${region}": [\n${toArrayString(ids)}\n  ]`);
    }
    return lines.join(',\n');
  };

  const chatModelsByRegion = buildRegionMapString((resource) =>
    (resource.functions ?? []).some((res) => res.id === 'text_chat'),
  );

  const visionModelsByRegion = buildRegionMapString((resource) =>
    (resource.functions ?? []).some((res) => res.id === 'image_chat'),
  );

  const fnCallingModelsByRegion = buildRegionMapString(
    (resource) =>
      (resource.functions ?? []).some((res) => res.id === 'text_chat') &&
      (resource.task_ids?.includes('function_calling') ?? false),
  );

  const oldContent = await readCodegenFile(PATH);
  const settingsAutogen = createCodegen({
    base: oldContent,
    id: 'watsonx-chat-model-ids',
    markerType: 'js',
    description:
      'All of the supported models fetched from watsonx API by region. Only non-deprecated models are included.',
    content: [
      '// Models here can be called from the /chat endpoint',
      '// and supports the `CoreMessage[]` type',
      'export const ChatModelLists = {',
      chatModelsByRegion,
      '} as const;',
      '',
      'export type WatsonxChatRegion = keyof typeof ChatModelLists;',
      '',
      '// Type generated from the object',
      'export type WatsonxChatModelId =',
      '  | (typeof ChatModelLists)[WatsonxChatRegion][number]',
      '  | (string & {});',
      '',
      '// Vision model',
      'export const VisionModelLists = {',
      visionModelsByRegion,
      '} as const;',
      '',
      '// Function calling model',
      'export const FunctionCallingModelLists = {',
      fnCallingModelsByRegion,
      '} as const;',
    ],
    append: '\n',
  });

  await writeCodegenContent({
    filePath: PATH,
    content: settingsAutogen,
  });
}
