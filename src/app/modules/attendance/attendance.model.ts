import mongoose, { Schema } from 'mongoose';
import { TAttendance } from './attendance.interface';

const attendanceSchema: Schema<TAttendance> = new Schema<TAttendance>(
  {
    employee: {
      type: Schema.ObjectId,
      required: [true, 'Employee is required.'],
      ref: 'Employee',
    },
    employeeId: {
      type: String,
      // required: [true, 'Employee id is required.'],
    },
    full_name: {
      type: String,
      // required: [true, 'Full name is required.'],
    },
    date: {
      type: String,
      // required: [true, 'Date is required.'],
    },
    designation: {
      type: String,
      // required: [true, 'Designation is required.'],
    },
    present: {
      type: Boolean,
      // required: [true, 'Present status is required.'],
    },
    absent: {
      type: Boolean,
      // required: [true, 'Absent status is required.'],
    },
    office_time: {
      type: String,
      // required: [true, 'Office time is required.'],
    },
    in_time: {
      type: String,
      // required: [true, 'Office in time is required.'],
    },
    out_time: {
      type: String,
      // required: [true, 'Office out time is required.'],
    },
    overtime: {
      type: Number,
      // required: [true, 'Overtime is required.'],
    },
    late_status: {
      type: Boolean,
      // required: [true, 'Late status is required.'],
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Attendance = mongoose.model<TAttendance>(
  'Attendance',
  attendanceSchema,
);
