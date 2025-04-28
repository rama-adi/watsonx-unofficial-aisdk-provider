import {z} from "zod";
import {systemDetailsSchema} from "../../types/watsonx-common-schema.ts";

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
    system: systemDetailsSchema
});


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
    system: systemDetailsSchema
});