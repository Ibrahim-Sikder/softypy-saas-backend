import { z } from 'zod';

const moneyReceiptValidationSchema = z.object({
  body: z.object({
    Id: z.string({ required_error: 'User id is required' }),
    user_type: z.string({ required_error: 'User type is required' }),
    job_no: z.string({ required_error: 'Order number is required' }),
    default_date: z.string().optional(),
    thanks_from: z.string({ required_error: 'Thanks for is required' }),
    against_bill_no_method: z.string({
      required_error: 'Billing method is required',
    }),
    full_reg_number: z.string().optional(),
    chassis_no: z
      .string()
      .optional(),
    payment_method: z.string({ required_error: 'Payment method is required' }),

    total_amount: z.number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number.',
    }),

    remaining: z.union([
      z.number({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number.',
      }),
      z.string({
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a string.',
      }),
    ]).refine(value => !isNaN(Number(value)), {
      message: 'Amount must be a valid number or numeric string.',
    }).optional(),
    
    taka_in_word: z.string().optional(),
  }),
});

export const moneyReceiptValidation = {
  moneyReceiptValidationSchema,
};
