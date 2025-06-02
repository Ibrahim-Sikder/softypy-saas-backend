import mongoose, { Schema, Document } from 'mongoose';
import { IEmployeeOvertime } from './overtime.interface';

const overtimeEntrySchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    hours: {
      type: Number,

    },
    reason: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const employeeOvertimeSchema: Schema = new Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Employee', 
      required: true,
    },
    entries: [overtimeEntrySchema],
    totalHours: {
      type: Number,
      default: 0,
    },
    estimatedPay: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const EmployeeOvertime = mongoose.model<IEmployeeOvertime & Document>(
  'EmployeeOvertime',
  employeeOvertimeSchema
);

export default EmployeeOvertime;
