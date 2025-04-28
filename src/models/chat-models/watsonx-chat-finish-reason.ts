import type { LanguageModelV1FinishReason } from "@ai-sdk/provider";

export function mapWatsonxChatFinishReason(
    reason: string | null | undefined
): LanguageModelV1FinishReason {
    switch(reason) {
        case 'stop':
            return 'stop';
        case 'length':
            return 'length';
        case 'tool_calls':
            return 'tool-calls';
        case 'time_limit':
            return 'other';
        case 'cancelled':
            return 'stop';
        case 'error':
            return 'error';
        case null:
        case undefined:
            return 'unknown';
        default:
            return 'unknown';
    }
}