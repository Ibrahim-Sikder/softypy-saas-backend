import mongoose, { Schema, model } from 'mongoose';
import { IExpense, IExpenseCategory } from './expense.interface';

const expenseItemSchema = new Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false },
);

export const expenseSchema = new Schema<IExpense>(
  {
    date: { type: String,  },
    invoice_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    invoiceCost: { type: Number },
    expense_items: { type: [expenseItemSchema], },
    payment_method: { type: String, },
    accountNumber: { type: String },
    transactionNumber: { type: String },
    note: { type: String },
    totalAmount: { type: Number },
    totalOtherExpense: { type: Number },
  },
  { timestamps: true },
);

export const Expense = model<IExpense>('Expense', expenseSchema);

export const expenseCategorySchema = new Schema<IExpenseCategory>({
  name: { type: String },
  code: { type: String },
});

export const ExpenseCategory = model<IExpenseCategory>(
  'ExpenseCategory',
  expenseCategorySchema,
);
