import { ObjectId } from "mongoose";

export type TBillPay = {
  // Supplier information
  supplier: ObjectId;
  supplierId: string;
  name: string;
  mobile_number?: string;
  address?: string;
  email?: string;
  shop_name?: string;

  
  // Bill information
  invoiceNumber?: string;
  billNumber?: string;
  against_bill: string;
  bill_category?: string;
  category?: string;
  amount: number;
  billTotal?: number;

  // Dates
  bill_date?: string;
  billDate?: string;
  due_date?: string;
  dueDate?: string;
  paid_on?: string;
  payment_date?: string;
  paymentDate?: string;

  // Payment details
  payment_against_bill?: string;
  individual_markup?: string;
  payment_method?: string;
  paymentStatus?: 'paid' | 'pending' | 'overdue' | 'completed';
  paymentReference?: string;
  payment_reference?: string;
  payment_terms?: string;
  payment_note?: string;
  payment_status?: string;

  // Transaction details
  transaction_no?: string;
  transactionId?: string;
  transaction_id?: string;

  // Additional information
  expense_note?: string;
  description?: string;

  // Bank details
  selected_bank?: string;
  bank_name?: string;
  bank_account_no?: string;
  account_number?: string;

  // Check details
  check_no?: string;
  check_number?: string;
  bkash_number?: string;
  nagad_number?: string;
  payment_method_name?: string;



  // Card details
  card_number?: string;
  card_holder_name?: string;
  card_transaction_no?: string;
  card_type?: string;
  expiration_date?: string;
  month_first?: string;
  year?: string;
  month_second?: string;
  security_code?: string;
  cvv?: string;

  // Mobile payment details
  mobile_payment_provider?: string;

  // Discount information

  discount_amount?: number;
  discount_value?: number;
  discountType?: 'percentage' | 'fixed';
  discount_type?: 'percentage' | 'fixed';
  apply_discount?: boolean;

  // Tax information
  taxAmount?: number;
  tax_amount?: number;
  taxRate?: number;
  tax_rate?: string;
  apply_tax?: boolean;

  // Recurring bill options
  is_recurring?: boolean;
  recurring_frequency?: string;
  recurring_end_date?: string;

  // Partial payment
  partial_payment?: boolean;
  partial_amount?: string;
  bill_attachments?: string;

  // Timestamps (added by Mongoose)
  createdAt?: Date;
  updatedAt?: Date;
};