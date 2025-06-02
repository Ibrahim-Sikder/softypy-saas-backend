import { Types } from 'mongoose';

export interface TEmployee {
  attendance: Types.ObjectId[];
  leave: Types.ObjectId[];
  salary: Types.ObjectId[];
  employeeId: string;
  full_name: string;
  date_of_birth: string;
  nid_number: number;
  blood_group: string;
  phone_number: string;
  country_code: string;
  full_phone_number: string;
  email: string;
  gender: string;
  join_date: string;
  designation: string;
  status: string;
  password: string;
  father_name: string;
  mother_name: string;
  guardian_name: string;
  guardian_country_code: string;
  guardian_contact: string;
  guardian_full_contact: string;
  relationship: string;
  nationality: string;
  religion: string;
  country: string;
  city: string;
  present_address: string;
  permanent_address: string;
  image: string;
  isRecycled: boolean;
  recycledAt: Date;
}
