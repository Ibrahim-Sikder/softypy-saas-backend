import mongoose, { Schema, Document } from 'mongoose';
import { IHoliday } from './holiday.interface';

const HolidaySchema = new Schema<IHoliday>(
  {
    holidayName: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    createdDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      required: true,
    },
    description: { type: String },
    applicableEmployees: { type: [String], default: [] },
    attachments: { type: String, },
  },
  { timestamps: true },
);

export const Holiday = mongoose.model<IHoliday>('Holiday', HolidaySchema);
