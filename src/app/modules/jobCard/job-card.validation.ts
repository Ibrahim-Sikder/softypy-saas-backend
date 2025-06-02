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
    date: z.string({ required_error: 'Date is required.' }),
    note: z.string({ required_error: 'Note is required.' }),
    vehicle_body_report: z.string({
      required_error: 'Vehicle body report is required.',
    }),
    technician_name: z.string({
      required_error: 'Technician name is required.',
    }),

    technician_date: z.string({
      required_error: 'Technician date is required.',
    }),
  }),
});

export const jobCardValidation = {
  jobCardValidationSchema,
};
