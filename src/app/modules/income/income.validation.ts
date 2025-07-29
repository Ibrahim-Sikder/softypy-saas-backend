import { z } from 'zod';
import { stringOrArrayOrNumber } from '../../utils/type';


const incomeValidationSchema = z.object({
  body: z.object({
    date: stringOrArrayOrNumber.optional(),
    invoice_number: stringOrArrayOrNumber.optional(),
    customer: stringOrArrayOrNumber.optional(),
    income_source: stringOrArrayOrNumber.optional(),
    amount: stringOrArrayOrNumber.optional(),
    payment_method: stringOrArrayOrNumber.optional(),
    reference_number: stringOrArrayOrNumber.optional(),
    description: stringOrArrayOrNumber.optional(),
  }),
});

const updateIncomeValidationSchema = z.object({
  body: z.object({
    date: stringOrArrayOrNumber.optional(),
    invoice_number: stringOrArrayOrNumber.optional(),
    customer: stringOrArrayOrNumber.optional(),
    income_source: stringOrArrayOrNumber.optional(),
    amount: stringOrArrayOrNumber.optional(),
    payment_method: stringOrArrayOrNumber.optional(),
    reference_number: stringOrArrayOrNumber.optional(),
    description: stringOrArrayOrNumber.optional(),
  }),
});

export const incomeValidation = {
  incomeValidationSchema,
  updateIncomeValidationSchema,
};
