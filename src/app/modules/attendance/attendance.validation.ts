import { z } from 'zod';

const timeStringSchema = z.string().refine(
  (time) => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  },
  {
    message: 'Invalid time format , expected "HH:MM" in 24 hours format',
  },
);

const attendanceValidationSchema = z.object({
  body: z
    .object({
      employeeId: z.string({ required_error: 'Employee Id is required.' }),
      full_name: z.string({ required_error: 'Full name is required.' }),
      date: z.string({ required_error: 'Date is required.' }),

      designation: z.string({ required_error: 'Designation is required.' }),
      present: z.boolean({ required_error: 'Present is required' }),
      absent: z.boolean({ required_error: 'Absent is required' }),
      office_time: z.string({ required_error: 'Office time is required.' }),
      in_time: timeStringSchema,

      out_time: timeStringSchema,
      overtime: z
        .number({
          required_error: 'Overtime is required.',
        })
        .nonnegative(),
      late_status: z.boolean({
        required_error: 'Late status is required.',
      }),
    })
    .refine(
      (body) => {
        const start = new Date(`1970-01-01T${body.in_time}:00`);
        const end = new Date(`1970-01-01T${body.out_time}:00`);

        return end > start;
      },
      {
        message: 'In time should be before out time.',
      },
    ),
});

export const attendanceValidation = {
  attendanceValidationSchema,
};
