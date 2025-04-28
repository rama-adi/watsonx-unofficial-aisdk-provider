import type { LanguageModelV1FinishReason } from "@ai-sdk/provider";

export function mapWatsonxCompletionFinishReason(
    reason: string | null | undefined
): LanguageModelV1FinishReason {
    switch (reason) {
        case "not_finished":
            return "other";
        case "max_tokens":
        case "token_limit":
            return "length";
        case "eos_token":
        case "stop_sequence":
            return "stop";
        case "cancelled":
            return "stop";
        case "time_limit":
            return "unknown";
        case "error":
            return "error";
        case null:
        case undefined:
            return "unknown";
        default:
            return "unknown";
    }
}