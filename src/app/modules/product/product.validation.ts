import { z } from 'zod';

export const commonFields = {
  product_name: z.string({ required_error: "Product name is required" }),
 product_type: z.array(z.string()).optional().or(z.null()),

  suppliers: z.array(z.string()),
  category: z.array(z.string()),
  product_code: z.string(),
  shipping: z.union([z.number(),z.string(), z.null()]).optional(),
  brand: z.array(z.string()),
    warehouse: z.array(z.string()),
  unit: z.array(z.string()),
  expense: z.union([z.number(), z.string()]).optional(),
  product_tax: z.union([z.number(), z.string()], { required_error: "Product tax is required" }).optional(),
  discount: z.union([z.number(), z.string()]).optional(),
  stock_alert: z.union([z.number(), z.string()]).optional(),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).default([]).optional(),
  initialStock: z.union([z.number(), z.string()]).optional(),
  reorderLevel: z.union([z.number(), z.string()]).optional(),
  expiryDateType: z.enum(["fixed", "variable", "none"], {
    required_error: "Expiry date type is required",
  }).optional(),
  expiryDate: z.string().nullable().optional(),
  manufacturingDate: z.string().nullable().optional(),

  shelfLife: z.union([z.number(),z.string(), z.null()]).optional(),
  shelfLifeUnit: z.enum(["days", "weeks", "months", "years"]).optional(),
  expiryAlertDays: z.union([z.number(), z.string(), z.null()]).optional(),

  batchNumber: z.string().optional(),
};

const createProduct = z.object({
  body: z.object(commonFields),
});

const updateProduct = z.object({
  body: z.object({
    ...Object.fromEntries(
      Object.entries(commonFields).map(([key, value]) => [key, value.optional()])
    ),
  }),
});

export const ProductValidations = {
  createProduct,
  updateProduct,
};
