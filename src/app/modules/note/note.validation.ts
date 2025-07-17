import { z } from 'zod';

export const createNoteValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    content: z.string({ required_error: 'Content is required' }),
    customerId: z.string({ required_error: 'Customer ID is required' }),
    status: z.enum(['active', 'archived']).default('active').optional(),
  }),
});

export const updateNoteValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(['active', 'archived']).optional(),
  }),
});
