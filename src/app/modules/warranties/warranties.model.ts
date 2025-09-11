import mongoose, { Schema } from 'mongoose';
import { TWarranty } from './warranties.interface';

export const warrantySchema: Schema<TWarranty> = new Schema<TWarranty>(
  {
    name: {
      type: String,
      required: [true, 'Warranty name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1'],
    },
    durationType: {
      type: String,
      enum: ['days', 'months', 'years'],
      required: [true, 'Duration type is required'],
    },
    terms: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

export const Warranty = mongoose.model<TWarranty>('Warranty', warrantySchema);
