import { createJsonErrorResponseHandler } from "@ai-sdk/provider-utils";
import { z } from "zod";

export const watsonxErrorResponseSchema = z.object({
    errors: z.array(z.object({
        code: z.string(),
        message: z.string(),
        more_info: z.string(),
    })),
    trace: z.string(),
    status_code: z.number(),
});

export const watsonxChatChunkSchema = z.object({
    id: z.string().nullish(),
    model_id: z.string().nullish(),
    created: z.number().nullish(),
    choices: z.array(
        z.object({
            delta: z.object({
                role: z.enum(['assistant']).optional(),
                content: z.string().nullish(),
                tool_calls: z.array(
                    z.object({
                        index: z.number().optional(),
                        id: z.string().optional(),
                        type: z.literal('function').nullish(),
                        function: z.object({
                            name: z.string(),
                            arguments: z.string()
                        }),
                    }),
                ).nullish(),
            }),
            finish_reason: z.enum(['stop', 'length', 'tool_calls', 'time_limit', 'cancelled', 'error']).nullish(),
            index: z.number(),
        }),
    ),
    model_version: z.string().nullish(),
    created_at: z.string().nullish(),
    usage: z.object({
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
        total_tokens: z.number(),
    }).nullish(),
    system: z.object({
        warnings: z.array(z.object({
            message: z.string(),
            id: z.string(),
            more_info: z.string(),
            additional_properties: z.record(z.string(), z.unknown()).optional(),
        })).nullish()
    }).nullish()
});

export const watsonxFailedResponseHandler = createJsonErrorResponseHandler({
    errorSchema: watsonxErrorResponseSchema,
    errorToMessage: data => [
        "watsonx API encountered error(s):",
        data.errors.map(e => "- " + e.message),
        "Trace ID: " + data.trace
    ].join("\n")
})

export const watsonxChatResponseSchema = z.object({
    id: z.string(),
    model_id: z.string(),
    created: z.number(),
    choices: z.array(
        z.object({
            message: z.object({
                role: z.literal('assistant'),
                content: z.string().nullish(),
                refusal: z.string().nullish(),
                tool_calls: z.array(
                    z.object({
                        id: z.string(),
                        type: z.literal('function'),
                        function: z.object({
                            name: z.string(),
                            arguments: z.string()
                        }),
                    }),
                ).nullish(),
            }),
            index: z.number(),
            finish_reason: z.enum(['stop', 'length', 'tool_calls', 'time_limit', 'cancelled', 'error']),
        }),
    ),
    model_version: z.string().nullish(),
    created_at: z.string(),
    usage: z.object({
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
        total_tokens: z.number(),
    }),
    system: z.object({
        warnings: z.array(z.object({
            message: z.string().optional(),
            id: z.string().optional(),
            more_info: z.string().optional(),
            additional_properties: z.record(z.string(), z.unknown()).optional(),
        })).optional()
    }).optional()
});
