import { z } from "zod";

export const subscriptionSchema = z.object({
  plan: z.string().min(1, { message: "Plan is required" }),
  startDate: z.string().datetime({ message: "Invalid start date" }),
  endDate: z.string().datetime({ message: "Invalid end date" }),
  isActive: z.boolean(),
});

export const tenantSchema = z.object({
  name: z.string().min(1, { message: "Tenant name is required" }),
  domain: z.string().min(1, { message: "Domain is required" }),
  dbUri: z.string().min(1, { message: "Database URI is required" }),
  subscription: subscriptionSchema,
  isActive: z.boolean().optional().default(true),
});
