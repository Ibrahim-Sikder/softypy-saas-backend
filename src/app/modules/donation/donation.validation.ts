import { z } from 'zod';

export const createDonationValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    mobile_number: z.string().min(1, 'Mobile number is required'),
    address: z.string().min(1, 'Address is required'),
    email: z
      .string()
      .email('Invalid email address')
      .min(1, 'Email is required'),
    donation_purpose: z.string().min(1, 'Donation purpose is required'),
    donation_amount: z.string().min(1, 'Donation amount is required'),
    donation_country: z.string().min(1, 'Donation country is required'),
    payment_method: z.string().optional(),
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
    description: z.string().optional(),
  }),
});

export const DonationValidations = {
  createDonationValidationSchema,
};
