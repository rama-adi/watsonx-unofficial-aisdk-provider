import {z} from "zod";

export const systemDetailsSchema = z.object({
    warnings: z.array(z.object({
        message: z.string().optional(),
        id: z.string().optional(),
        more_info: z.string().optional(),
        additional_properties: z.record(z.string(), z.unknown()).optional(),
    })).optional()
}).optional();

export const watsonxModerationsSchema = z.object({
    hap: z.object({
        input: z.object({
            enabled: z.boolean(),
            threshold: z.number().min(0).max(1),
        }),
        output: z.object({
            enabled: z.boolean(),
            threshold: z.number().min(0).max(1),
        }),
        mask: z.object({
            remove_entity_value: z.boolean(),
        })
    }),
    pii: z.object({
        input: z.object({
            enabled: z.boolean(),
        }),
        output: z.object({
            enabled: z.boolean(),
        }),
        mask: z.object({
            remove_entity_value: z.boolean(),
        })
    }),
}).optional();