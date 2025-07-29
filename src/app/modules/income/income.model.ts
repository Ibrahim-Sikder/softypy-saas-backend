import mongoose, { Schema } from 'mongoose';
import type { TIncome } from './income.interface';

export const incomeSchema: Schema<TIncome> = new Schema<TIncome>(
  {
    date: {
      type: Schema.Types.Mixed, 
    },
    invoice_number: {
      type: Schema.Types.Mixed,
    },
    customer: {
      type: Schema.Types.Mixed,
    },
    
    income_source: {
      type: Schema.Types.Mixed,
    },
    amount: {
      type: Schema.Types.Mixed,
    },
    payment_method: {
      type: Schema.Types.Mixed,
    },
    reference_number: {
      type: Schema.Types.Mixed,
    },
    description: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

export const Income = mongoose.model<TIncome>('Income', incomeSchema);
