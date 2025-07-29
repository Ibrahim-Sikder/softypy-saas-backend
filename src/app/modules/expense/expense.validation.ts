import { z } from "zod";
import { stringOrArrayOrNumber } from "../../utils/type";

export const createExpenseValidationSchema = z.object({
  body: z.object({
    date: z.string().optional(),
    invoice_id: stringOrArrayOrNumber.optional(),
    expense_category: stringOrArrayOrNumber.optional(),
    vendor: stringOrArrayOrNumber.optional(),
    amount: stringOrArrayOrNumber.optional(),
    payment_method: stringOrArrayOrNumber.optional(),
    reference_no: z.string().optional(),
    note: z.string().optional(),
    attachment: z.string().optional(),
  }),
});
export const createExpenseCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    code: z.string().optional(),
    
  }),
});

export const updateExpenseCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    code: z.string().optional(),
   
  }),
});
