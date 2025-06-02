import { z } from 'zod';

export const leaveRequestSchema = z.object({
  body: z.object({
    employee: z.string().min(24, 'Invalid employee ID'),
    leaveType: z.string({required_error:'Leave type is required!'}),
    fromDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid fromDate format',
    }),
    toDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Invalid toDate format',
    }),
    noOfDays: z.number().min(1, 'Number of days must be at least 1'),
    remainingLeaves: z.number().min(0, 'Remaining leaves cannot be negative'),
    reason: z.string().min(5, 'Reason must be at least 5 characters'),
    status: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
  }),
});
export const updateValidationSchema = z.object({
  body: z.object({
    employeeId: z.string().optional(),
    leaveType: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    noOfDays: z.number().optional(),
    remainingLeaves: z.number().optional(),
    reason: z.string().optional(),
    status: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
  }),
});

export const LeaveRequestValidations = {
    leaveRequestSchema,
    updateValidationSchema
}
