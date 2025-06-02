import { z } from 'zod';

const incomeValidationSchema = z.object({
  body: z.object({
    category: z.array(z.string({ required_error: 'Category is required.' })),
    income_name: z.string({ required_error: 'Income name is required.' }),
    invoice_number: z.string({ required_error: 'Invoice number is required.' }),

    date: z.string({
      required_error: 'Date is required.',
    }),
    amount: z
      .number({
        required_error: 'Amount is required.',
        invalid_type_error: 'Amount must be a number',
      })
      .min(0, { message: 'Amount must be more than 0' }),
    description: z.string().optional(),
    image: z.string().optional(),
    receipt_number: z.string({ required_error: 'Receipt number is required.' }),
    income_source: z.string().optional(),

    service_type: z.string(),
    customer: z.string({ required_error: 'Customer name is required.' }),
    job_card: z.string({ required_error: 'Jobcard is required.' }),
    invoice: z.string().optional(),
    vehicle: z.string({ required_error: 'Vehicle is required.' }),
    department: z.string().optional(),
    payment_method: z.string().optional(),
    payment_status: z.string(),
    reference_number: z.string().optional(),
    tax_applied: z.boolean().optional().default(false),
    tax_rate: z.number().optional().default(0),
    tax_amount: z.number().optional().default(0),
    total_amount: z.number().optional(),
    document_notes: z.string().optional(),
  }),
});
const updateIncomeValidationSchema = z.object({
  body: z.object({
    category: z.array(z.string({ required_error: 'Category is required.' })),
    income_name: z.string({ required_error: 'Income name is required.' }),
    invoice_number: z.string({ required_error: 'Invoice number is required.' }),
    date: z.string({
      required_error: 'Date is required.',
    }),
    amount: z
      .number({
        required_error: 'Amount is required.',
        invalid_type_error: 'Amount must be a number',
      })
      .min(0, { message: 'Amount must be more than 0' }),
    description: z.string().optional(),
    image: z.string().optional(),
    receipt_number: z.string({ required_error: 'Receipt number is required.' }),
    income_source: z.string(),
    service_type: z.string().optional(),
    customer: z.string().optional(),
    job_card: z.string().optional(),
    invoice: z.string().optional(),
    vehicle: z.string().optional(),
    department: z.string().optional(),
    payment_method: z.string().optional(),
    payment_status: z.string(),
    reference_number: z.string().optional(),
    tax_applied: z.boolean().optional().default(false),
    tax_rate: z.number().optional().default(0),
    tax_amount: z.number().optional().default(0),
    total_amount: z.number().optional(),
    document_notes: z.string().optional(),
  }),
});

export const incomeValidation = {
  incomeValidationSchema,
  updateIncomeValidationSchema,
};
