import type { Document, ObjectId } from "mongoose";

export interface IIncomeItem {
  name: string;
  amount: number;
}

export interface IIncome extends Document {
  date: string;
  invoice_id?: string | ObjectId;
  income_items: IIncomeItem[];
  payment_method: string;
  accountNumber?: string;
  transactionNumber?: string;
  note?: string;
  totalAmount?: number;
  serviceIncomeAmount:number;
  partsIncomeAmount:number;
  totalInvoiceIncome:number;
  totalOtherIncome:number
  referanceNo:number
}
