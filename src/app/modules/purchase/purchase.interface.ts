import { ObjectId } from 'mongoose';

export interface TPurchase {
  date: string;
  referenceNo: string;
  warehouse: ObjectId;
  attachDocument: string;
  suppliers: ObjectId;
  shipping: number;
  purchasStatus: 'Incomplete' | 'Complete' | 'Draft';
  note: string;
  paymentMethod: string;
  totalAmount: number;
  totalDiscount: number;
  totalTax: number;
  totalShipping: number;
  grandTotal: number;
  products: {
    productId: ObjectId;
    productName: string;
    productUnit: string;
    discount: number | string;
    productPrice: number | string;
    tax: number | string;
    quantity: number | string;
    serialNumber?: string;
  }[];
}
