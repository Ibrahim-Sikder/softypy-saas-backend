import { z } from 'zod';

const employeeValidationSchema = z.object({
  body: z.object({
    full_name: z.string({ required_error: 'Full name is required.' }),
    date_of_birth: z.string({ required_error: 'Birth date is required.' }),
    phone_number: z.string({
      required_error: 'Phone number is required.',
    }),
    email: z.string({ required_error: 'Email is required.' }),
    nid_number: z.number().optional(),
    gender: z.string({ required_error: 'Gender is required.' }),
    join_date: z.string({ required_error: 'Join date is required.' }),
    designation: z.string({ required_error: 'Designation is required.' }),
    status: z.string({ required_error: 'Status is required.' }),
    father_name: z.string({
      required_error: 'Father name is required.',
    }),
    mother_name: z.string({
      required_error: 'Mother name is required.',
    }),
    guardian_name: z.string({
      required_error: 'Guardian name is required.',
    }),
    guardian_contact: z.string().optional(),
    relationship: z.string({
      required_error: 'Relationship is required.',
    }),
    nationality: z.string().optional(),
    religion: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),

    present_address: z.string({
      required_error: 'Present address is required.',
    }),
    permanent_address: z.string({
      required_error: 'Permanent address is required.',
    }),
  }),
});

export const employeeValidation = {
  employeeValidationSchema,
};
