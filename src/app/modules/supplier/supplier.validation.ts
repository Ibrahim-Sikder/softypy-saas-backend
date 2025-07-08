import { z } from 'zod';

const supplierValidationSchema = z.object({
  body: z.object({
    full_name: z.string({ required_error: 'Full name is required.' }),
    phone_number: z.string({ required_error: 'Phone number is required.' }),
    country_code: z.string(),
    email: z
      .string().optional(),
    vendor: z.string().optional(),
    shop_name: z.string({ required_error: 'Shop name is required.' }).optional(),
    business_type: z.string({ required_error: 'Business type is required.' }).optional(),
    tax_id: z.string({ required_error: 'Tax ID is required.' }).optional(),
    registration_number: z.string({
      required_error: 'Registration number is required.',
    }).optional(),
    website: z.string().optional(),
    country: z.string({ required_error: 'Country name is required.' }).optional(),
    city: z.string({ required_error: 'City name is required.' }).optional(),
    state: z.string({ required_error: 'State is required.' }).optional(),
    postal_code: z.string({ required_error: 'Postal code is required.' }).optional(),
    street_address: z.string({ required_error: 'Street address is required.' }).optional(),
    delivery_instructions: z.string().optional(),
    year_established: z.number({
      required_error: 'Year established is required.',
    }).optional(),
    number_of_employees: z.number({
      required_error: 'Number of employees is required.',
    }).optional(),
    annual_revenue: z.number({ required_error: 'Annual revenue is required.' }).optional(),
    business_description: z.string().optional(),
    bank_name: z.string({ required_error: 'Bank name is required.' }).optional(),
    account_number: z.string({ required_error: 'Account number is required.' }).optional(),
    swift_code: z.string({ required_error: 'SWIFT code is required.' }).optional(),
    tax_exempt: z.boolean().default(false).optional(),
    tax_exemption_number: z.string().optional(),
    credit_terms: z.boolean().default(false),
    payment_terms: z.string({ required_error: 'Payment terms are required.' }).optional(),
    credit_limit: z.number().optional(),
    delivery_terms: z.string({
      required_error: 'Delivery terms are required.',
    }).optional(),
    minimum_order_value: z.number({
      required_error: 'Minimum order value is required.',
    }).optional(),
    lead_time: z.number({ required_error: 'Lead time is required.' }).optional(),
    shipping_method: z.string().optional(),
    supply_chain_notes: z.string().optional(),
    // supplier_rating: z
    //   .number({ required_error: 'Supplier rating is required.' })
    //   .min(0, 'Rating must be at least 0')
    //   .max(5, 'Rating cannot exceed 5'),
    supplier_status: z.enum(['active', 'pending', 'inactive'], {
      required_error: 'Supplier status is required.',
    }).optional(),
    quality_certification: z.string().optional(),
    notes: z.string().optional(),
    supplier_photo: z.string({ required_error: 'Supplier photo is required.' }).optional(),
  }),
});

export const supplierValidation = {
  supplierValidationSchema,
};
