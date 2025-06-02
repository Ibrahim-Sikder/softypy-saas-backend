import { ObjectId } from 'mongoose';

export interface IEmployeeOvertimeEntry {
  date: Date | null;
  startTime: string | null;
  endTime: string | null;
  hours: number;
  reason: string;
  location: string;
  department: string;
  isUrgent: boolean;
}

export interface IEmployeeOvertime {
  employee: ObjectId;
  entries: IEmployeeOvertimeEntry[];
  totalHours: number;
  estimatedPay: number;
}
