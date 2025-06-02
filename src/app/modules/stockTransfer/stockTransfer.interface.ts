import { ObjectId } from "mongoose";

export interface IStockTransfer {
  product: ObjectId;
  fromWarehouse: ObjectId;
  toWarehouse: ObjectId;
  quantity: number;
  transferId: string;
  batchNumber?: string;
  expiryDate?: Date;
  note?: string;
  createdAt?: Date;
    status?: 'completed' | 'pending' | 'transit'; 
}
