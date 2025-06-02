import { ObjectId } from 'mongoose';

export interface ILeaveRequest {
  employee: ObjectId;
  leaveType: string;
  fromDate: Date;
  toDate: Date;
  noOfDays: number;
  remainingLeaves: number;
  reason: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: string;
  updatedAt?: string;
}

