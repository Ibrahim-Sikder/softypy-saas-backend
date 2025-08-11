import mongoose, { Schema, model } from "mongoose";
import { IIncome } from "./income.interface";

export const incomeItemSchema = new Schema(
  {
    name: { type: String },
    amount: { type: Number,  },
  },
  { _id: false },
);

export const incomeSchema = new Schema<IIncome>(
  {
    date: { type: String },
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    income_items: { type: [incomeItemSchema] },
    payment_method: { type: String },
    accountNumber: { type: String },
    transactionNumber: { type: String },
    note: { type: String },
    totalAmount: { type: Number },
    serviceIncomeAmount: { type: Number },
    partsIncomeAmount: { type: Number },
    totalInvoiceIncome: { type: Number },
    totalOtherIncome: { type: Number },
    referanceNo: { type: Number },
  },
  { timestamps: true },
);

export const Income = model<IIncome>("Income", incomeSchema);
