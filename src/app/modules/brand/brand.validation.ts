import { z } from 'zod';

const createbrandValidationSchema = z.object({
  body: z.object({
    brand: z
      .string({
        required_error: 'Brand is required',
      }),
   
  }),
});
const updatebrandValidationSchema = z.object({
  body: z.object({
    brand: z
      .string().optional(),
  }),
});

export const BrandValidations = {
    createbrandValidationSchema,
    updatebrandValidationSchema
};
