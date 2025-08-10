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
  | {
      type: 'image_url';
      image_url: { url: string; detail?: 'low' | 'high' | 'auto' };
    }
  | {
      type: 'video_url';
      video_url: { url: string };
    };

export interface WatsonxAssistantMessage {
  role: 'assistant';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

export interface WatsonxToolMessage {
  role: 'tool';
  content: string;
  tool_call_id: string;
}
