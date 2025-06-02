import mongoose, { Schema } from 'mongoose';
import { TProductType } from './productType.interface';

const productTypeSchema: Schema = new Schema<TProductType>(
  {
    product_type: {
      type: String,
      required: [true, 'Product Type is required'],
    },
  },
  {
    timestamps: true,
  },
);

export const ProductType = mongoose.model<TProductType>(
  'ProductType',
  productTypeSchema,
);
