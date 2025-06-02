import { Types } from 'mongoose';

export interface IStockTransaction {
  product: Types.ObjectId;
  warehouse: string;
  quantity: number;
  batchNumber?: string;
  type: 'in' | 'out';
  referenceType?: string; 
  referenceId?: Types.ObjectId;
  sellingPrice?: number;
  date?: Date;
}
