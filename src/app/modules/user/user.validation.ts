import { z } from 'zod';
export const createUserValidation = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Required' }).email(),
    password: z.string({ required_error: 'Password is required' }),
    tenantDomain: z.string({required_error:'Tenant domain is required!' }),
  }),
});



export const userValidations = {
  createUserValidation,
};
