import mongoose, { Schema, Document } from 'mongoose';
import { ILeaveRequest } from './leave.interface';

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    leaveType: {
      type: String,
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    noOfDays: { type: Number, required: true },
    remainingLeaves: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);

const LeaveRequest = mongoose.model<ILeaveRequest>(
  'LeaveRequest',
  LeaveRequestSchema,
);

export default LeaveRequest;
