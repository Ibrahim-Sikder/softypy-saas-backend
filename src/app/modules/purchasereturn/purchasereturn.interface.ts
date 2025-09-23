import { ObjectId } from 'mongoose';

export interface TPurchaseReturn {
  returnDate: string;
  purchaseId: ObjectId;
  referenceNo: string;
  supplier: ObjectId;
  purchase: ObjectId;
  products: ObjectId;
  supplierName?: string;
  warehouse: string;
  returnReason: string;
  returnNote?: string;
  totalRefund: number;
  purchaseInvoiceNo?: string;
  date: Date;
  note: string;
  items: {
    productId: ObjectId;
    productCode: string;
    productName: string;
    quantity: number;

    maxQuantity?: number;
    unitPrice: number;
    unit: string;
    totalAmount: number;
  }[];

  totalReturnAmount: number;

  status?: 'pending' | 'completed' | 'cancelled';
}
