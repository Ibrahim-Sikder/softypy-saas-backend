import { z } from 'zod';
const createAdjustmentSchema = z.object({
  body: z.object({
    date: z.string(),
    referenceNo: z.string(),
    attachDocument: z.string().optional(),
    products: z.array(
      z.object({
        productId: z.string(),
        productName: z.string(),
        productCode: z.string(),
        type: z.enum(['Subtraction', 'Addition']),
        quantity: z.union([z.number(), z.string()]),
        serialNumber: z.string().optional(),
      }),
    ),
    note: z.string(),
  }),
});

const updateAdjustmentSchema = z.object({
  body: z.object({
    productId: z.string(),
    productName: z.string(),
    productCode: z.string(),
    type: z.enum(['Subtraction', 'Addition']),
    quantity: z.string(),
    serialNumber: z.string().optional(),
  }),
});

export const AdjustmentValidations = {
  createAdjustmentSchema,
  updateAdjustmentSchema,
};
