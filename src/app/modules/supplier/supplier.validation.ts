import { z } from 'zod';

const supplierValidationSchema = z.object({
  body: z.object({
    full_name: z.string({ required_error: 'Full name is required.' }),
    phone_number: z.string({ required_error: 'Phone number is required.' }),
    country_code: z.string({ required_error: 'Country code is required.' }),
    email: z
      .string({ required_error: 'Email is required.' })
      .email('Invalid email format.'),
    vendor: z.string({ required_error: 'Vendor name is required.' }),
    shop_name: z.string({ required_error: 'Shop name is required.' }),
    business_type: z.string({ required_error: 'Business type is required.' }),
    tax_id: z.string({ required_error: 'Tax ID is required.' }),
    registration_number: z.string({
      required_error: 'Registration number is required.',
    }),
    website: z.string().optional(),
    country: z.string({ required_error: 'Country name is required.' }),
    city: z.string({ required_error: 'City name is required.' }),
    state: z.string({ required_error: 'State is required.' }),
    postal_code: z.string({ required_error: 'Postal code is required.' }),
    street_address: z.string({ required_error: 'Street address is required.' }),
    delivery_instructions: z.string().optional(),
    year_established: z.number({
      required_error: 'Year established is required.',
    }),
    number_of_employees: z.number({
      required_error: 'Number of employees is required.',
    }),
    annual_revenue: z.number({ required_error: 'Annual revenue is required.' }),
    business_description: z.string().optional(),
    bank_name: z.string({ required_error: 'Bank name is required.' }),
    account_number: z.string({ required_error: 'Account number is required.' }),
    swift_code: z.string({ required_error: 'SWIFT code is required.' }),
    tax_exempt: z.boolean().default(false),
    tax_exemption_number: z.string().optional(),
    credit_terms: z.boolean().default(false),
    payment_terms: z.string({ required_error: 'Payment terms are required.' }),
    credit_limit: z.number().optional(),
    delivery_terms: z.string({
      required_error: 'Delivery terms are required.',
    }),
    minimum_order_value: z.number({
      required_error: 'Minimum order value is required.',
    }),
    lead_time: z.number({ required_error: 'Lead time is required.' }),
    shipping_method: z.string().optional(),
    supply_chain_notes: z.string().optional(),
    supplier_rating: z
      .number({ required_error: 'Supplier rating is required.' })
      .min(0, 'Rating must be at least 0')
      .max(5, 'Rating cannot exceed 5'),
    supplier_status: z.enum(['active', 'pending', 'inactive'], {
      required_error: 'Supplier status is required.',
    }),
    quality_certification: z.string().optional(),
    notes: z.string().optional(),
    supplier_photo: z.string({ required_error: 'Supplier photo is required.' }),
  }),
});

export const supplierValidation = {
  supplierValidationSchema,
};
