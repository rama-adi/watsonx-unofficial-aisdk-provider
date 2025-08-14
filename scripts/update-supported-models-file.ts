import type { APIResponse } from './index.ts';
import {
  readCodegenFile,
  writeCodegenContent,
} from './write-codegen-content.ts';
import { createCodegen } from './create-codegen.ts';

export async function updateSupportedModelsFile(
  modelsByRegion: Record<string, APIResponse>,
) {
  const PATH = '../supported-models.md';
  const old = await readCodegenFile(PATH);
  await updateChatModels(old, PATH, modelsByRegion);
  const afterChat = await readCodegenFile(PATH);
  await updateEmbeddingModels(afterChat, PATH, modelsByRegion);
  const afterEmb = await readCodegenFile(PATH);
  await updateTextgenModels(afterEmb, PATH, modelsByRegion);
}

async function updateChatModels(
  oldContent: string,
  path: string,
  modelsByRegion: Record<string, APIResponse>,
) {
  const regions = Object.keys(modelsByRegion);

  type ChatAggregate = {
    provider: string;
    supportsFunctionCalling: boolean;
    regions: Set<string>;
  };

  const chatByModel = new Map<string, ChatAggregate>();

  for (const region of regions) {
    const response = modelsByRegion[region]!;
    const resources = Array.isArray((response as any)?.resources)
      ? ((response as any).resources as APIResponse['resources'])
      : [];

    for (const resource of resources) {
      if ((resource.lifecycle ?? []).some((l) => l.id === 'deprecated'))
        continue;
      if (!(resource.functions ?? []).some((f) => f.id === 'text_chat'))
        continue;

      const existing = chatByModel.get(resource.model_id);
      const supportsFunctionCalling =
        !!resource.task_ids?.includes('function_calling');

      if (!existing) {
        chatByModel.set(resource.model_id, {
          provider: resource.provider,
          supportsFunctionCalling,
          regions: new Set([region]),
        });
      } else {
        existing.supportsFunctionCalling =
          existing.supportsFunctionCalling || supportsFunctionCalling;
        existing.regions.add(region);
      }
    }
  }

  const rows = Array.from(chatByModel.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([modelId, info]) => {
      const fcSo = info.supportsFunctionCalling ? '✅' : '❌';
      const regionsList = Array.from(info.regions).join(', ');
      return `| \`${modelId}\` | ${info.provider} | ${fcSo} | ${fcSo} | ${regionsList} |`;
    })
    .join('\n');

  const settingsAutogen = createCodegen({
    base: oldContent,
    id: 'readme-chat-models',
    markerType: 'html',
    description:
      'Chat models tables grouped by model with available regions per model.',
    content: [
      '| ID | Provider | Function Calling | Structured Outputs | Regions |',
      '|----|----------|------------------|--------------------|---------|',
      rows,
    ],
    append: '\n',
  });

  await writeCodegenContent({
    filePath: path,
    content: settingsAutogen,
  });
}

async function updateEmbeddingModels(
  oldContent: string,
  path: string,
  modelsByRegion: Record<string, APIResponse>,
) {
  const regions = Object.keys(modelsByRegion);

  type EmbAggregate = {
    provider: string;
    maxSeq: number | 'N/A';
    dim: number | 'N/A';
    regions: Set<string>;
  };

  const embByModel = new Map<string, EmbAggregate>();

  for (const region of regions) {
    const response = modelsByRegion[region]!;
    const resources = Array.isArray((response as any)?.resources)
      ? ((response as any).resources as APIResponse['resources'])
      : [];

    for (const resource of resources) {
      if ((resource.lifecycle ?? []).some((l) => l.id === 'deprecated'))
        continue;
      if (!(resource.functions ?? []).some((f) => f.id === 'embedding'))
        continue;

      const existing = embByModel.get(resource.model_id);
      const maxSeq = resource.model_limits?.max_sequence_length ?? 'N/A';
      const dim = resource.model_limits?.embedding_dimension ?? 'N/A';

      if (!existing) {
        embByModel.set(resource.model_id, {
          provider: resource.provider,
          maxSeq,
          dim,
          regions: new Set([region]),
        });
      } else {
        existing.regions.add(region);
        // Prefer numeric values when available
        if (existing.maxSeq === 'N/A' && maxSeq !== 'N/A')
          existing.maxSeq = maxSeq;
        if (existing.dim === 'N/A' && dim !== 'N/A') existing.dim = dim;
      }
    }
  }

  const rows = Array.from(embByModel.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([modelId, info]) => {
      const regionsList = Array.from(info.regions).join(', ');
      return `| \`${modelId}\` | ${info.provider} | ${info.maxSeq} | ${info.dim} | ${regionsList} |`;
    })
    .join('\n');

  const settingsAutogen = createCodegen({
    base: oldContent,
    id: 'readme-embedding-models',
    markerType: 'html',
    description:
      'Embedding models tables grouped by model with available regions per model.',
    content: [
      '| ID | Provider | Max Sequence Length | Embedding Dimensions | Regions |',
      '|----|----------|---------------------|----------------------|---------|',
      rows,
    ],
    append: '\n',
  });

  await writeCodegenContent({
    filePath: path,
    content: settingsAutogen,
  });
}

async function updateTextgenModels(
  oldContent: string,
  path: string,
  modelsByRegion: Record<string, APIResponse>,
) {
  const regions = Object.keys(modelsByRegion);

  type CmpAggregate = {
    provider: string;
    regions: Set<string>;
  };

  const completionByModel = new Map<string, CmpAggregate>();

  for (const region of regions) {
    const response = modelsByRegion[region]!;
    const resources = Array.isArray((response as any)?.resources)
      ? ((response as any).resources as APIResponse['resources'])
      : [];

    for (const resource of resources) {
      if ((resource.lifecycle ?? []).some((l) => l.id === 'deprecated'))
        continue;
      const hasTextGen = (resource.functions ?? []).some(
        (f) => f.id === 'text_generation',
      );
      const hasChat = (resource.functions ?? []).some(
        (f) => f.id === 'text_chat',
      );
      if (!(hasTextGen && !hasChat)) continue;

      const existing = completionByModel.get(resource.model_id);
      if (!existing) {
        completionByModel.set(resource.model_id, {
          provider: resource.provider,
          regions: new Set([region]),
        });
      } else {
        existing.regions.add(region);
      }
    }
  }

  const rows = Array.from(completionByModel.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([modelId, info]) => {
      const regionsList = Array.from(info.regions).join(', ');
      return `| \`${modelId}\` | ${info.provider} | ${regionsList} |`;
    })
    .join('\n');

  const settingsAutogen = createCodegen({
    base: oldContent,
    id: 'readme-completion-models',
    markerType: 'html',
    description:
      'Completion models tables grouped by model with available regions per model.',
    content: [
      '| ID | Provider | Regions |',
      '|----|----------|---------|',
      rows,
    ],
    append: '\n',
  });

  await writeCodegenContent({
    filePath: path,
    content: settingsAutogen,
  });
}
