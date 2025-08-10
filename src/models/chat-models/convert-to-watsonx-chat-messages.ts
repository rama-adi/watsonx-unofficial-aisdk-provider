import {
  type LanguageModelV2Prompt,
  UnsupportedFunctionalityError,
} from '@ai-sdk/provider';
import { convertUint8ArrayToBase64 } from '@ai-sdk/provider-utils';
import type { WatsonxPrompt } from './watsonx-chat-prompt.ts';

export function convertToWatsonxChatMessages(
  prompt: LanguageModelV2Prompt,
): WatsonxPrompt {
  const messages: WatsonxPrompt = [];

  for (let i = 0; i < prompt.length; i++) {
    const { role, content } = prompt[i];
    const isLastMessage = i === prompt.length - 1;

    switch (role) {
      case 'system': {
        messages.push({ role: 'system', content });
        break;
      }

      case 'user': {
        messages.push({
          role: 'user',
          content: content.map((part) => {
            switch (part.type) {
              case 'text': {
                return { type: 'text', text: part.text };
              }
              case 'file': {
                // watsonx text chat does not document image/video URL parts; reject files
                throw new UnsupportedFunctionalityError({
                  functionality:
                    'File content in user messages is not supported by watsonx text chat',
                });
              }
            }
          }),
        });
        break;
      }

      case 'assistant': {
        let text = '';
        const toolCalls: Array<{
          id: string;
          type: 'function';
          function: { name: string; arguments: string };
        }> = [];

        for (const part of content) {
          switch (part.type) {
            case 'text': {
              text += part.text;
              break;
            }
            case 'tool-call': {
              toolCalls.push({
                id: part.toolCallId,
                type: 'function',
                function: {
                  name: part.toolName,
                  arguments:
                    typeof part.input === 'string'
                      ? part.input
                      : JSON.stringify(part.input),
                },
              });
              break;
            }
          }
        }

        messages.push({
          role: 'assistant',
          content: text,
          tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        });

        break;
      }
      case 'tool': {
        for (const toolResponse of content) {
          let resultContent = '';

          switch (toolResponse.output.type) {
            case 'text':
            case 'error-text':
              resultContent = toolResponse.output.value;
              break;
            case 'json':
            case 'error-json':
              resultContent = JSON.stringify(toolResponse.output.value);
              break;
            case 'content':
              resultContent = JSON.stringify(toolResponse.output.value);
              break;
          }

          messages.push({
            role: 'tool',
            content: resultContent,
            tool_call_id: toolResponse.toolCallId,
          });
        }
        break;
      }
      default: {
        throw new Error(`Unsupported role: ${role}`);
      }
    }
  }

  return messages;
}
