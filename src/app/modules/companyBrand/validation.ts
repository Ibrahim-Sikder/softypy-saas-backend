import { z } from 'zod';

const createCompanyBrandValidation = z.object({
  body: z.object({
    name: z.string({ required_error: 'CompanyBrand name is required' }),
    logo: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateCompanyBrandValidation = z.object({
  body: z.object({
    name: z.string().optional(),
    logo: z.string().optional(),
  }),
});

export const CompanyBrandValidations = {
  createCompanyBrandValidation,
  updateCompanyBrandValidation,
};
