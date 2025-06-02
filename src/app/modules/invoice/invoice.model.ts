import mongoose, { Schema } from 'mongoose';
import { TInvoice } from './invoice.interface';

const invoiceSchema: Schema<TInvoice> = new Schema<TInvoice>(
  {
    invoice_no: {
      type: String,
      required: [true, 'Invoice number is required'],
    },
    user_type: {
      type: String,
      enum: ['customer', 'company', 'showRoom'],
    },
    Id: {
      type: String,
    },
    job_no: {
      type: String,
    },
    date: {
      type: String,
    },
    customer: {
      type: Schema.ObjectId,
      ref: 'Customer',
    },
    company: {
      type: Schema.ObjectId,
      ref: 'Company',
    },
    showRoom: {
      type: Schema.ObjectId,
      ref: 'ShowRoom',
    },
    vehicle: {
      type: Schema.ObjectId,
      ref: 'Vehicle',
    },
    moneyReceipts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MoneyReceipt',
    },
    input_data: [
      {
        description: { type: String, trim: true },
        quantity: Number,
        unit: String,
        rate: Number,
        total: Number,
      },
    ],
    service_input_data: [
      {
        description: { type: String, trim: true },
        quantity: Number,
        unit: String,
        rate: Number,
        total: Number,
      },
    ],
    total_amount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    parts_total: {
      type: Number,
      required: [true, 'Parts total amount is required'],
    },
    parts_total_In_words: {
      type: String,
      required: [true, 'Parts total amount is required'],
    },
    service_total: {
      type: Number,
      required: [true, 'Service total amount is required'],
    },
    service_total_in_words: {
      type: String,
      required: [true, 'Service total amount is required'],
    },
    discount: {
      type: Number,
    },
    vat: {
      type: Number,
    },
    net_total: {
      type: Number,
      required: [true, 'Net total is required'],
    },
    net_total_in_words: {
      type: String,
      required: [true, 'Net total is required'],
    },
    advance: {
      type: Number,
    },
    due: {
      type: Number,
    },
    isRecycled: { type: Boolean, default: false },
    recycledAt: { type: Date, default: null },

  },
  {
    timestamps: true,
  },
);

export const Invoice = mongoose.model<TInvoice>('Invoice', invoiceSchema);
