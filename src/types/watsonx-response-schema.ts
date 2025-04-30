import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

export const watsonxErrorResponseSchema = z.object({
  errors: z.array(
    z.object({
      code: z.string(),
      message: z.string(),
      more_info: z.string(),
    }),
  ),
  trace: z.string(),
  status_code: z.number(),
});

export const watsonxFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: watsonxErrorResponseSchema,
  errorToMessage: (data) =>
    [
      'watsonx API encountered error(s):',
      data.errors.map((e) => '- ' + e.message),
      'Trace ID: ' + data.trace,
    ].join('\n'),
});
