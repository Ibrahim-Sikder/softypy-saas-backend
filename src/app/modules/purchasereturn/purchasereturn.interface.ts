
import { ObjectId } from "mongoose";

export interface TPurchaseReturn {
  returnDate: string;
  purchaseId: ObjectId;
  referenceNo: string;
  supplier: ObjectId;
  supplierName?: string;
  warehouse: string;
  returnReason: string;
  returnNote?: string;
  purchaseInvoiceNo?: string; 

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