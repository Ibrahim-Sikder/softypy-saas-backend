import { Schema, model } from 'mongoose';
import { TReview } from './review.interface';


const reviewSchema = new Schema<TReview>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    images: {
      type: [String],
      required: [true, 'Image is required'],
    },
    createdAt: {
      type: String
    },
  },
  {
    timestamps: true, 
  },
);

export const Review = model<TReview>('Review', reviewSchema);
