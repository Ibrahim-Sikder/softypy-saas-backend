import { z } from 'zod';

export const contactValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    garageName: z.string().optional(),
    phone: z.string().optional(),
    message: z.string().optional(),
  }),
});
