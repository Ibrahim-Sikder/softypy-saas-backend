import { z } from 'zod';

const createReviewValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    designation: z.string().min(1, { message: 'Designation is required' }),
    images: z.array(z.string()).optional(),
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
  }),
});

const updateReviewValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    designation: z.string().min(1, { message: 'Designation is required' }),
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    images: z.array(z.string()).optional(),
  }),
});

export const reviewValidations = {
  createReviewValidationSchema,
  updateReviewValidationSchema,
};
