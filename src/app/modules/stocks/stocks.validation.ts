import { z } from 'zod';

export const stockCreateValidation = z.object({
  body: z.object({
    product: z.string({ required_error: 'Product ID is required' }),
    type: z.enum(['in', 'out'], {
      required_error: 'Stock type (in/out) is required',
    }),

    quantity: z
      .number({ required_error: 'Quantity is required' })
      .min(0, 'Quantity cannot be negative'),

    referenceType: z.enum(['purchase', 'sale', 'repair', 'opening', 'return'], {
      required_error: 'Reference type is required',
    }),

    // referenceId: z.string().optional(),

    purchasePrice: z
      .number()
      .nonnegative()
      .optional()
      .refine((val) => typeof val === 'number' || val === undefined, {
        message: 'Purchase price must be a number',
      }),

    sellingPrice: z
      .number()
      .nonnegative()
      .optional()
      .refine((val) => typeof val === 'number' || val === undefined, {
        message: 'Selling price must be a number',
      }),

    batchNumber: z.string().optional(),

    expiryDate: z
      .string()
      .transform((str) => new Date(str))
      .optional(),

    note: z.string().optional(),

    date: z
      .string()
      .transform((str) => new Date(str))
      .optional(), // Allow frontend to send specific date
  }),
});
