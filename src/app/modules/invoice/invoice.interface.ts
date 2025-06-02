import { Types } from 'mongoose';

export interface TInvoice {
  invoice_no: string;
  user_type: 'customer' | 'company' | 'showRoom';
  Id: string;
  job_no: string;
  date: string;
  customer: Types.ObjectId;
  company: Types.ObjectId;
  showRoom: Types.ObjectId;
  vehicle: Types.ObjectId;
  input_data: [
    {
      description: string;
      unit: string;
      quantity: number;
      rate: number;
      total: number;
    },
  ];
  service_input_data: [
    {
      description: string;
      quantity: number;
      unit: string;
      rate: number;
      total: number;
    },
  ];
  total_amount: number;
  parts_total: number;
  parts_total_In_words: string;
  service_total: number;
  service_total_in_words: string;
  discount: number;
  vat: number;
  net_total: number;
  net_total_in_words: string;
  advance: number;
  due: number;
  isRecycled: boolean;
  recycledAt: Date;
  moneyReceipts: Types.ObjectId;
}
