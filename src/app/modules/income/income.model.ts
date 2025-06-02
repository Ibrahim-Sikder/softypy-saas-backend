import mongoose, { Schema } from 'mongoose';
import type { TIncome } from './income.interface';

const incomeSchema: Schema<TIncome> = new Schema<TIncome>(
  {
    category: [
      {
        type: String,
        required: [true, 'Category is required.'],
      },
    ],
    income_name: {
      type: String,
      required: [true, 'Income name is required.'],
    },
    invoice_number: {
      type: String,
      required: [true, 'Invoice number is required.'],
    },
    date: {
      type: String,
      required: [true, 'Date is required.'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required.'],
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },

    receipt_number: {
      type: String,
      required: [true, 'Receipt number is required.'],
    },
    income_source: {
      type: String,
      required: [true, 'Income source is required.'],
    },
    service_type: {
      type: String,
    },

    customer: {
      type: String,
    },
    job_card: {
      type: String,
    },
    invoice: {
      type: String,
    },
    vehicle: {
      type: String,
    },
    department: {
      type: String,
    },

    payment_method: {
      type: String,
    },
    payment_status: {
      type: String,
    },
    reference_number: {
      type: String,
    },
    tax_applied: {
      type: Boolean,
      default: false,
    },
    tax_rate: {
      type: Number,
      default: 0,
    },
    tax_amount: {
      type: Number,
      default: 0,
    },
    total_amount: {
      type: Number,
    },

    document_notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Income = mongoose.model<TIncome>('Income', incomeSchema);
