import mongoose, { Schema } from 'mongoose';
import { TJobCard } from './job-card.interface';

const addToJobCardSchema: Schema<TJobCard> = new Schema<TJobCard>(
  {
    Id: {
      type: String,
    },
    chassis_no: {
      type: String,
    },
    user_type: {
      type: String,
      required: [true, 'User type is required'],
      enum: ['customer', 'company', 'showRoom'],
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    showRoom: {
      type: Schema.Types.ObjectId,
      ref: 'ShowRoom',
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
    },

    job_no: {
      type: String,
      required: [true, 'Job number is required.'],
    },
    date: {
      type: String,
      required: [true, 'Date is required.'],
    },

    vehicle_interior_parts: {
      type: String,
    },
    reported_defect: {
      type: String,
    },
    reported_action: {
      type: String,
    },
    note: {
      type: String,
    },
    vehicle_body_report: {
      type: String,
    },
    technician_name: {
      type: String,
      required: [true, 'Technician name is required.'],
    },
    technician_signature: {
      type: String,
    },
    technician_date: {
      type: String,
    },
    vehicle_owner: {
      type: String,
    },
    isRecycled: { type: Boolean, default: false },
    recycledAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export const JobCard = mongoose.model<TJobCard>('JobCard', addToJobCardSchema);
