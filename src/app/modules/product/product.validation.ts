import { z } from 'zod';

const commonFields = {
  product_name: z.string({ required_error: "Product name is required" }),
  product_type: z.array(z.string()).optional(),
  suppliers: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  product_code: z.string().optional(),
  shipping: z.union([z.number(), z.string()]).optional(),
  brand: z.array(z.string()).optional(),
    warehouse: z.array(z.string()).optional(),
  unit: z.array(z.string()).optional(),
  expense: z.union([z.number(), z.string()]).optional(),
  product_tax: z.union([z.number(), z.string()], { required_error: "Product tax is required" }),
  discount: z.union([z.number(), z.string()]).optional(),
  stock_alert: z.union([z.number(), z.string()]).optional(),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).default([]),
  initialStock: z.union([z.number(), z.string()]).optional(),
  reorderLevel: z.union([z.number(), z.string()]).optional(),
  expiryDateType: z.enum(["fixed", "variable", "none"], {
    required_error: "Expiry date type is required",
  }),
  expiryDate: z.string().nullable().optional(),
  manufacturingDate: z.string().nullable().optional(),

  shelfLife: z.union([z.number(),z.string(), z.null()]).optional(),
  shelfLifeUnit: z.enum(["days", "weeks", "months", "years"]).optional(),
  expiryAlertDays: z.union([z.number(), z.string()]).optional(),
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
