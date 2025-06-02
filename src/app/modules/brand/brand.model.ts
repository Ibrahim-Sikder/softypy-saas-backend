import mongoose, { Schema } from 'mongoose';
import { TBrand } from './brand.interface';

export const brandSchema: Schema = new Schema<TBrand>(
  {
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    }
  },
  {
    timestamps: true,
  },
);

export const Brand = mongoose.model<TBrand>('Brand', brandSchema);
