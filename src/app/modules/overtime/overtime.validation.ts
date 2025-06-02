import { z } from 'zod';

const overtimeEntrySchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  hours: z.number().positive().optional(),
  reason: z.string().min(1, 'Reason is required'),
  location: z.string().min(1, 'Location is required'),
  department: z.string().min(1, 'Department is required'),
  isUrgent: z.boolean().optional(),
});

export const EmployeeOvertimeValidationSchema = z.object({
  body: z.object({
    employee: z.array(z.string()).optional(),
    entries: z
      .array(overtimeEntrySchema)
      .min(1, 'At least one overtime entry is required'),
    // totalHours: z.number().default(0).optional(),
    // estimatedPay: z.number().default(0).optional(),
  }),
});

export const updateValidationSchema = z.object({
  body: z.object({
    employee:z.array(z.string()).optional(),
    entries: z.array(overtimeEntrySchema).optional(),
    // totalHours: z.number().optional(),
    // estimatedPay: z.number().optional(),
  }),
});
