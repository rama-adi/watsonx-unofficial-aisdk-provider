import {
    type LanguageModelV1,
    type LanguageModelV1CallWarning,
    UnsupportedFunctionalityError,
} from '@ai-sdk/provider';

export function prepareTools(
    mode: Parameters<LanguageModelV1['doGenerate']>[0]['mode'] & {
        type: 'regular';
    },
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
    toolWarnings: LanguageModelV1CallWarning[];
} {
    // when the tools array is empty, change it to undefined to prevent errors:
    const tools = mode.tools?.length ? mode.tools : undefined;
    const toolWarnings: LanguageModelV1CallWarning[] = [];

    if (tools == null) {
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

    for (const tool of tools) {
        if (tool.type === 'provider-defined') {
            toolWarnings.push({ type: 'unsupported-tool', tool });
        } else {
            watsonxTools.push({
                type: 'function',
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters,
                },
            });
        }
    }

    const toolChoice = mode.toolChoice;

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
                toolWarnings 
            };
        case 'required':
            return { 
                tools: watsonxTools, 
                tool_choice_option: 'auto', 
                toolWarnings 
            };
        case 'tool':
            const filteredTools = watsonxTools.filter(
                tool => tool.function.name === toolChoice.toolName
            );
            return {
                tools: filteredTools,
                tool_choice: {
                    type: 'function',
                    function: {
                        name: toolChoice.toolName
                    }
                },
                toolWarnings
            };
        default: {
            const _exhaustiveCheck: never = type;
            throw new UnsupportedFunctionalityError({
                functionality: `Unsupported tool choice type: ${_exhaustiveCheck}`,
            });
        }
    }
}