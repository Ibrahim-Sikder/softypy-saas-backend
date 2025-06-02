import { z } from 'zod';

const createProductType = z.object({
  body: z.object({
    product_type: z.string({
      required_error: 'Product Type is required',
    }),
  }),
});
const updateProductType = z.object({
  body: z.object({
    product_type: z.string().optional(),
  }),
});

export const ProductTypeValidations = {
  createProductType,
  updateProductType,
};
