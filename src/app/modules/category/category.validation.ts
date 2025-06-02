import { z } from 'zod';

export const categoryValidationSchema = z.object({
  body: z.object({
    sub_category: z
      .string({ required_error: 'Sub-category is required' })

      .trim(),
    main_category: z.string({ required_error: 'Main category is required' }),
    image: z.string().optional(),
  }),
});
export const updateValidationSchema = z.object({
  body: z.object({
    sub_category: z.string().optional(),
    main_category: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const CatgoryValidations = {
  categoryValidationSchema,
  updateValidationSchema,
};
