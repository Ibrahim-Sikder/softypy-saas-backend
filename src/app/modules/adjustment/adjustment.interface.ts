import { ObjectId } from 'mongoose';

export type TAdjustmentProduct = {
  productId: ObjectId;
  productName: string;
  productCode: string;
  type: 'Subtraction' | 'Addition';
  quantity: number;
  serialNumber?: string;
};

export type TAdjustment = {
  date: Date;
  referenceNo: string;
  attachDocument?: string;
  warehouse: ObjectId;
  products: TAdjustmentProduct[];
  note: string;
};
