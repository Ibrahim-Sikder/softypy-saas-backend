import mongoose, { model, Schema } from 'mongoose';
import { IExpense, IExpenseCategory, IExpenseModel } from './expense.interface';

const expenseSchema: Schema<IExpense> = new Schema<IExpense>(
  {
    date: { type: String, required: true },
    expense_type: { type: String },
    warehouse: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExpenseCategory',
      required: true,
    },
    voucher_no: { type: String, required: true },
    tax: { type: String, required: true },
    expense_note: { type: String },
    amount: { type: Schema.Types.Mixed, required: true },
    payment_individual_markup: { type: String },
    payment_method: { type: String, required: true },
    payment_account: { type: String },
    bank_account_no: { type: String },
    check_no: { type: String },
    card_number: { type: String },
    card_holder_name: { type: String },
    card_transaction_no: { type: String },
    card_type: { type: String },
    month_first: { type: String },
    year: { type: String },
    month_second: { type: String },
    security_code: { type: String },
    transaction_no: { type: String },
    transactionId: { type: String },
    document: { type: String },
    cash_by: { type: String, default: '' },
  },
  {
    timestamps: true,
  },
);
const Expense = model<IExpense, IExpenseModel>('Expense', expenseSchema);

const expenseCategorySchema = new Schema<IExpenseCategory>({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  expenses: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Expense Category Model
const ExpenseCategory = model<IExpenseCategory>(
  'ExpenseCategory',
  expenseCategorySchema,
);

export { Expense, ExpenseCategory };
