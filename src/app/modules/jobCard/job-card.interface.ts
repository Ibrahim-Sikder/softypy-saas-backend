import { Types } from 'mongoose';

export interface TJobCard {
  Id: string;
  chassis_no: string;
  user_type: 'customer' | 'company' | 'showRoom';
  customer: Types.ObjectId;
  company: Types.ObjectId;
  showRoom: Types.ObjectId;
  vehicle: Types.ObjectId;
  job_no: string;
  date: string;
  vehicle_interior_parts: string;
  reported_defect: string;
  reported_action: string;
  note: string;
  vehicle_body_report: string;
  technician_name: string;
  technician_signature: string;
  technician_date: string;
  vehicle_owner: string;
  isRecycled: boolean;
  recycledAt: Date;
}
