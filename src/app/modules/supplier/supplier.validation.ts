import { z } from 'zod';

const supplierValidationSchema = z.object({
  body: z.object({
    full_name: z.string({ required_error: 'Supplier name is required.' }),
    contact_person_name: z.string({
      required_error: 'Contact person name is required.',
    }),
    country_code: z.string().optional(),
    phone_number: z.string().optional(),
    email: z.string().optional(),
    vendor: z.string().optional(),
    tax_id: z.string().optional(),
    street_address: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().optional(),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
    swift_code: z.string().optional(),
    supplier_status: z
      .union([z.enum(['active', 'inactive']), z.literal('')])
      .optional()
      .default('active'),

    notes: z.string().optional(),
  }),
});

export const supplierValidation = {
  supplierValidationSchema,
};
