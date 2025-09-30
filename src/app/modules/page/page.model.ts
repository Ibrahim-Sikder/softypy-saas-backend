import { Schema, model } from 'mongoose';
import { IPage } from './page.interface';

export const pageSchema = new Schema<IPage>(
  {
    name: {
      type: String,
      required: [true, 'Page name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    path: {
      type: String,
      required: [true, 'Path is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);


const Page = model<IPage>('Page', pageSchema);

export default Page;