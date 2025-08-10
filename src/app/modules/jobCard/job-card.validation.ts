import { z } from 'zod';

const jobCardValidationSchema = z.object({
  body: z.object({
    Id: z.string({ required_error: 'Id is required.' }),
    user_type: z.string({
      required_error: 'User type is required.',
    }),
    job_no: z
      .number({ required_error: 'Job no is required.' })
      .nonnegative({ message: 'Job number must be a positive number' }),
    date: z.string(),
    note: z.string().optional(),
    vehicle_body_report: z.string().optional(),
    technician_name: z.string().optional(),

    technician_date: z.string().optional(),
  }),
});

export const jobCardValidation = {
  jobCardValidationSchema,
};
