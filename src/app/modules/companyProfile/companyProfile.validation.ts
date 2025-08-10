// validations/companyProfileValidation.ts
import { z } from 'zod';

export const createCompanyProfileSchema = z.object({
  body: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(4, 'Phone number is required'),
    whatsapp: z.string().optional(),
    website: z.string().url('Invalid website URL'),
    address: z.string().min(1, 'Address is required'),
    description: z
      .string()
      .min(10, 'Description should be at least 10 characters'),

  }),
});
