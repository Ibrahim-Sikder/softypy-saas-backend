import { Types } from 'mongoose';

export interface TAttendance {
  employee: Types.ObjectId;
  employeeId: string;
  full_name: string;
  date: string;

  designation: string;
  present: boolean;
  absent: boolean;
  office_time: string;
  in_time: string;
  out_time: string;
  overtime: number;
  late_status: boolean;
}
