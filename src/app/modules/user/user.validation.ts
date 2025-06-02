import { z } from 'zod';
export const createUserValidation = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Required' }).email(),
    password: z.string({ required_error: 'Password is required' }),
    tenantId: z.string({ required_error: 'Required' }),
    role: z.string({ required_error: 'Required' }),
  }),
});



export const userValidations = {
  createUserValidation,
};
