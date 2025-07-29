import type { Document, ObjectId } from "mongoose";

export interface IExpense extends Document {
  date: string;
  invoice_id: string;
  expense_category: ObjectId;
  vendor?: string;
  amount: number | string;
  payment_method: string;
  reference_no?: string;
  note?: string;
  attachment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IExpenseCategory extends Document {
  name: string
  code: string
  expenses?: ObjectId[]
  createdAt?: Date
  updatedAt?: Date
}