import { z } from 'zod';
import {
  systemDetailsSchema,
  watsonxModerationsSchema,
} from '../../types/watsonx-common-schema.ts';

const textgenTokenInfo = z.array(
  z.object({
    text: z.string(),
    logprob: z.number(),
    rank: z.number(),
    top_tokens: z.array(
      z.object({
        text: z.string(),
        logprob: z.number(),
      }),
    ),
  }),
);

export const watsonxCompletionChunkSchema = z.object({
  model_id: z.string().nullish(),
  created: z.number().nullish(),
  results: z.array(
    z.object({
      generated_text: z.string(),
      stop_reason: z.string(),
      generated_token_count: z.number().nullish(),
      input_token_count: z.number().nullish(),
      seed: z.number().nullish(),
      generated_tokens: textgenTokenInfo.optional(),
      input_tokens: textgenTokenInfo.optional(),
      moderations: watsonxModerationsSchema,
    }),
  ),
  model_version: z.string().nullish(),
  created_at: z.string().nullish(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .nullish(),
  system: systemDetailsSchema,
});

export const watsonxCompletionResponseSchema = z.object({
  model_id: z.string(),
  model_version: z.string().nullish(),
  created_at: z.string(),
  results: z.array(
    z.object({
      generated_text: z.string(),
      stop_reason: z.string(),
      generated_token_count: z.number(),
      input_token_count: z.number(),
      seed: z.number().nullish(),
      generated_tokens: textgenTokenInfo.optional(),
      input_tokens: textgenTokenInfo.optional(),
      moderations: watsonxModerationsSchema,
    }),
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .nullish(),
  system: systemDetailsSchema,
});
