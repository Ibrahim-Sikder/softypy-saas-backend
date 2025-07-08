import { z } from 'zod';

export const createExpenseValidationSchema = z.object({
  body: z.object({
    date: z.string({ required_error: 'Date is required' }),
    warehouse: z.string().optional(),
    category: z.array(z.string()).optional(),
    voucher_no: z.string().optional(),
    tax: z.string().optional(),
    expense_note: z.string().optional(),
    amount: z.union([z.number(), z.string({required_error:'Amount is required!'})]),
    payment_individual_markup: z.string().optional(),
    payment_method: z.string({ required_error: 'Payment method is required' }),
    payment_account: z.string().optional(),
    bank_account_no: z.string().optional(),
    check_no: z.string().optional(),
    card_number: z.string().optional(),
    card_holder_name: z.string().optional(),
    card_transaction_no: z.string().optional(),
    card_type: z.string().optional(),
    month_first: z.string().optional(),
    year: z.string().optional(),
    month_second: z.string().optional(),
    security_code: z.string().optional(),
    transaction_no: z.string().optional(),
    transactionId: z.string().optional(),
  }),
});
export const createExpenseCategorySchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Please provide the category's name",
      }),
    code: z
      .string({
        required_error: "Please provide the category's code",
      }),
    expenses: z
      .array(
        z.string().refine((value) => /^[a-fA-F0-9]{24}$/.test(value), {
          message: 'Invalid ObjectId',
        }),
      )
      .optional(),
  }),
});

export const updateExpenseCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    code: z.string().optional(),
    expenses: z
      .array(
        z.string().refine((value) => /^[a-fA-F0-9]{24}$/.test(value), {
          message: 'Invalid ObjectId',
        }),
      )
      .optional(),
  }),
});
