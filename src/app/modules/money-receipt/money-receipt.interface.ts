import { Types } from 'mongoose';
export interface TMoneyReceipt {
  customer: Types.ObjectId;
  company: Types.ObjectId;
  showRoom: Types.ObjectId;
  vehicle: Types.ObjectId;
  moneyReceiptId: string;
  Id: string;
  user_type: string;
  job_no: string;
  default_date: string;
  thanks_from: string;
  against_bill_no_method: string;
  full_reg_number: string;
  chassis_no: string;
  payment_method: string;
  account_number: string;
  transaction_id: string;
  check_number: string;
  bank_name: string;
  // payment_number: string;
  date: string;
  check_date: string;
  // bank_number: number;
  payment_date: string;
  total_amount: number;
  total_amount_in_words: string;
  advance: number;
  advance_in_words: string;
  remaining: number;
  remaining_in_words: string;
  taka_in_word: string;
  cash_by:string,
  isRecycled: boolean;
  recycledAt: Date;
  invoice: Types.ObjectId; 
  payment_status: 'advance' | 'final';
}

