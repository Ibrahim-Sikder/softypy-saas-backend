import { z } from 'zod';

const createUnitValidationSchema = z.object({
  body: z.object({
    unit: z
      .string({
        required_error: 'Unit is required',
      }),
  
  }),
});
const updateUnitValidationSchema = z.object({
  body: z.object({
    unit: z
      .string().optional(),
    
  }),
});

export const UnitValidations = {
    createUnitValidationSchema,
    updateUnitValidationSchema
};
