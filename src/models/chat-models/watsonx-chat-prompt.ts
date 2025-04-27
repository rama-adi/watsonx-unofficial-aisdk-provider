export type WatsonxPrompt = Array<WatsonxMessage>;

export type WatsonxMessage =
  | WatsonxSystemMessage
  | WatsonxUserMessage
  | WatsonxAssistantMessage
  | WatsonxToolMessage;

export interface WatsonxSystemMessage {
  role: 'system';
  content: string;
}

export interface WatsonxUserMessage {
  role: 'user';
  content: Array<WatsonxUserMessageContent>;
}

export type WatsonxUserMessageContent =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: string }
  | { type: 'video_url'; video_url: string };

export interface WatsonxAssistantMessage {
  role: 'assistant';
  content: string;
  prefix?: boolean;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

export interface WatsonxToolMessage {
  role: 'tool';
  name: string;
  content: string;
  tool_call_id: string;
}