import { z } from 'zod';

export const createWarrantyValidation = z.object({
  name: z.string().min(1, 'Warranty name is required'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1'),
  durationType: z.enum(['days', 'months', 'years']),
  terms: z.string().optional(),
  tenantDomain: z.string().optional(),
});

export const updateWarrantyValidation = createWarrantyValidation.partial();
