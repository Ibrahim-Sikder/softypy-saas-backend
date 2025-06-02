import { z } from 'zod';

const billPayValidationSchema = z.object({
  body: z.object({
    supplier: z.string().optional(),
    supplierId: z.string().optional(),
    name: z.string({ required_error: 'Name is required' }),
    mobile_number: z.string({ required_error: 'Mobile number is required' }),
    address: z.string({ required_error: 'Address is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    shop_name: z.string({ required_error: 'Shop name is required' }),

    invoiceNumber: z.string().optional(),
    billNumber: z.string().optional(),
    against_bill: z.string({ required_error: 'Bill number is required' }),
    bill_category: z
      .string({ required_error: 'Bill category is required' })
      .optional(),
    category: z.string({ required_error: 'Vendor category is required' }),
    amount: z.union(
      [
        z.number().min(0, 'Amount must be a positive number'),
        z.string().transform((val) => parseFloat(val) || 0),
      ],
      {
        required_error: 'Amount is required',
        invalid_type_error: 'Amount must be a number',
      },
    ),
    billTotal: z.number().optional(),

    bill_date: z.string({ required_error: 'Bill date is required' }).optional(),
    billDate: z.string().optional(),
    due_date: z.string({ required_error: 'Due date is required' }).optional(),
    dueDate: z.string().optional(),
    paid_on: z.string().optional(),
    payment_date: z
      .string({ required_error: 'Payment date is required' })
      .optional(),
    paymentDate: z.string().optional(),
    payment_against_bill: z.string().optional(),
    individual_markup: z.string().optional(),
    payment_method: z.string({ required_error: 'Payment method is required' }),
    paymentStatus: z.string().optional(),
    payment_status: z.string().optional(),
    paymentReference: z.string().optional(),
    payment_reference: z.string().optional(),
    payment_terms: z.string().optional(),
    payment_note: z.string().optional(),
    transaction_no: z.string().optional(),
    transactionId: z.string().optional(),
    transaction_id: z.string().optional(),
    expense_note: z.string().optional(),
    description: z.string().optional(),
    selected_bank: z.string().optional(),
    bank_name: z.string().optional(),
    bank_account_no: z.string().optional(),
    account_number: z.string().optional(),
    check_no: z.string().optional(),
    check_number: z.string().optional(),
    card_number: z.string().optional(),
    card_holder_name: z.string().optional(),
    card_transaction_no: z.string().optional(),
    card_type: z.string().optional(),
    expiration_date: z.string().optional(),
    month_first: z.string().optional(),
    year: z.string().optional(),
    month_second: z.string().optional(),
    security_code: z.string().optional(),
    cvv: z.string().optional(),
    mobile_payment_provider: z.string().optional(),
    discountAmount: z.number().optional(),
    discount_amount: z
      .union([z.string(), z.number().transform((n) => n.toString())])
      .optional(),
    discountValue: z.number().optional(),
    discount_value: z
      .union([z.string(), z.number().transform((n) => n.toString())])
      .optional(),
    discountType: z.string().optional(),
    discount_type: z.string().optional(),
    apply_discount: z.boolean().optional().default(false),

    tax_amount: z
      .union([z.string(), z.number().transform((n) => n.toString())])
      .optional(),
    taxRate: z.number().optional(),
    tax_rate: z
      .union([z.string(), z.number().transform((n) => n.toString())])
      .optional(),
    apply_tax: z.boolean().optional().default(false),
    is_recurring: z.boolean().optional().default(false),
    recurring_frequency: z.string().optional(),
    recurring_end_date: z.string().nullable().optional(),
    partial_payment: z.boolean().optional().default(false),
    partial_amount: z
      .union([z.string(), z.number().transform((n) => n.toString())])
      .optional(),

    bill_attachments: z.string().optional(),
  }),
});

export const billPayValidation = {
  billPayValidationSchema,
};
