import mongoose, { model, Schema } from 'mongoose';
import { IExpense, IExpenseCategory } from './expense.interface';

export const expenseSchema: Schema<IExpense> = new Schema<IExpense>(
  {
    date: { type: String },
    invoice_id: { type: Schema.Types.Mixed },
    expense_category: {
      type: Schema.Types.Mixed,
      ref: 'ExpenseCategory',
    },
    vendor: { type: Schema.Types.Mixed },
    amount: { type: Schema.Types.Mixed },
    payment_method: { type: String },
    reference_no: { type: String },
    note: { type: String },
    attachment: { type: String },
  },
  { timestamps: true },
);

export const Expense = model<IExpense>('Expense', expenseSchema);

export const expenseCategorySchema = new Schema<IExpenseCategory>({
  name: { type: String },
  code: { type: String },
});

// Expense Category Model
export const ExpenseCategory = model<IExpenseCategory>(
  'ExpenseCategory',
  expenseCategorySchema,
);
