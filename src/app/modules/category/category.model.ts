import mongoose, { Schema } from 'mongoose';
import { TCategory } from './category.interface';

const categorySchema: Schema = new Schema<TCategory>(
  {
    sub_category: {
      type: String,
      required: [true, 'Sub-category is required'],
      trim: true,
    },
    main_category: {
      type: String,
      required: [true, 'Main category is required'],
      trim: true,
    },
    image: {
      type: String,
      // required: [true, 'Image URL is required'],
    },
  },
  {
    timestamps: true,
  },
);

export const Category = mongoose.model<TCategory>('Category', categorySchema);
