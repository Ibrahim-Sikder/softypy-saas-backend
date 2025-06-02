import { z } from 'zod';

export const StockTransferItemSchema = z.object({
  productId: z.string({ required_error: 'Product is required' }),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  note: z.string().optional(),
});

export const StockTransferSchema = z.object({
  date: z.string({ required_error: 'Date is required' }),
  referenceNo: z.string().min(1, 'Reference No is required'),
  fromLocation: z.string().min(1, 'From location is required'),
  toLocation: z.string(),
  transferredBy: z.string().min(1, 'Transferred By is required'),
  items: z.array(StockTransferItemSchema).min(1, 'At least one product must be added'),
});
