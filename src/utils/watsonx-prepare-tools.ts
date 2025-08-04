import {
  type LanguageModelV2CallWarning,
  type LanguageModelV2FunctionTool,
  type LanguageModelV2ProviderDefinedTool,
  UnsupportedFunctionalityError,
} from '@ai-sdk/provider';

export function prepareTools(
  tools:
    | Array<LanguageModelV2FunctionTool | LanguageModelV2ProviderDefinedTool>
    | undefined,
  toolChoice:
    | { type: 'auto' | 'none' | 'required' | 'tool'; toolName?: string }
    | undefined,
): {
  tools:
    | Array<{
        type: 'function';
        function: {
          name: string;
          description: string | undefined;
          parameters: unknown;
        };
      }>
    | undefined;
  tool_choice_option?: 'auto';
  tool_choice?: {
    type: 'function';
    function: {
      name: string;
    };
  };
  toolWarnings: LanguageModelV2CallWarning[];
} {
  // when the tools array is empty, change it to undefined to prevent errors:
  const validTools = tools?.length ? tools : undefined;
  const toolWarnings: LanguageModelV2CallWarning[] = [];

  if (validTools == null) {
    return { tools: undefined, toolWarnings };
  }

  const watsonxTools: Array<{
    type: 'function';
    function: {
      name: string;
      description: string | undefined;
      parameters: unknown;
    };
  }> = [];

  for (const tool of validTools) {
    if (tool.type === 'provider-defined') {
      toolWarnings.push({ type: 'unsupported-tool', tool });
    } else if (tool.type === 'function') {
      watsonxTools.push({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      });
    }
  }

  if (toolChoice == null) {
    return { tools: watsonxTools, toolWarnings };
  }

  const type = toolChoice.type;

  switch (type) {
    case 'auto':
    case 'none':
      return {
        tools: watsonxTools,
        tool_choice_option: 'auto',
        toolWarnings,
      };
    case 'required':
      return {
        tools: watsonxTools,
        tool_choice_option: 'auto',
        toolWarnings,
      };
    case 'tool':
      const filteredTools = watsonxTools.filter(
        (tool) => tool.function.name === toolChoice.toolName,
      );
      return {
        tools: filteredTools,
        tool_choice: {
          type: 'function',
          function: {
            name: toolChoice.toolName!,
          },
        },
        toolWarnings,
      };
    default: {
      const _exhaustiveCheck: never = type;
      throw new UnsupportedFunctionalityError({
        functionality: `Unsupported tool choice type: ${_exhaustiveCheck}`,
      });
    }
  }
}
