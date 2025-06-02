import { Document, Types } from 'mongoose';

export interface IStock extends Document {
  product: Types.ObjectId;
  warehouse: Types.ObjectId;
  type: 'in' | 'out';
  quantity: number;
  referenceType: 'purchase' | 'sale' | 'repair' | 'opening' | 'return' | 'adjustment';
  referenceId?: Types.ObjectId;
  purchasePrice?: number;
  sellingPrice?: number;
  batchNumber?: string;
  expiryDate?: Date;
  note?: string;
  date: Date;
}
