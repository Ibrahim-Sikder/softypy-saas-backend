import { z } from 'zod';

export const HolidayValidationSchema = z.object({
  body: z.object({
    holidayName: z.string().min(1, 'Holiday name is required'),
    fromDate: z.coerce.date().refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid date format',
    }),
    toDate: z.coerce.date().refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid date format',
    }),
    totalDays: z
      .number()
      .int()
      .positive('Total days must be a positive integer'),
    status: z.enum(['active', 'inactive', 'pending']),
    description: z.string().optional(),
    applicableEmployees: z.array(z.string()).default([]),
  }),
});
export const updateValidationSchema = z.object({
  body: z.object({
    holidayName: z.string(),
    fromDate: z.coerce.date().refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid date format',
    }),
    toDate: z.coerce.date().refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid date format',
    }),
    totalDays: z
      .number()
      .int()
      .positive('Total days must be a positive integer'),
    status: z.enum(['active', 'inactive', 'pending']),
    description: z.string().optional(),
    applicableEmployees: z.array(z.string()).default([]),
  }),
});
