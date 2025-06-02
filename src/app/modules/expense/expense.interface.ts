import type { Document, Model, ObjectId } from "mongoose"

export interface IExpenseCategory extends Document {
  name: string
  code: string
  expenses?: ObjectId[]
  createdAt?: Date
  updatedAt?: Date
}

export interface IExpense extends Document {
  date: string
  expense_type?: string
  warehouse: string
  category: ObjectId
  voucher_no: string
  tax: string
  expense_note?: string
  amount: number | string
  payment_individual_markup?: string
  payment_method: string
  payment_account?: string
  bank_account_no?: string
  check_no?: string
  card_number?: string
  card_holder_name?: string
  card_transaction_no?: string
  card_type?: string
  month_first?: string
  year?: string
  month_second?: string
  security_code?: string
  transaction_no?: string
  transactionId?: string
  document?: string
  cash_by?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IExpenseModel extends Model<IExpense> {
  findExpensesByCategory(categoryId: ObjectId): Promise<IExpense[]>
  findExpensesByDateRange(startDate: string, endDate: string): Promise<IExpense[]>
  findExpensesByPaymentMethod(method: string): Promise<IExpense[]>
  calculateTotalExpensesByCategory(categoryId: ObjectId): Promise<number>
}

