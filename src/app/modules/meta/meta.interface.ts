import { Types } from 'mongoose';

export interface UnifiedData {
  id: string; 
  userType: string; 
  name: string;
  vehicles: Types.ObjectId[]; 
  jobCards: Types.ObjectId[]; 
  quotations: Types.ObjectId[];
  invoices: Types.ObjectId[]; 
  moneyReceipts: Types.ObjectId[]; 
  address: string;
  contact: string; 
  countryCode: string; 
  email: string;
  driverName: string; 
  driverContact: string;
  driverCountryCode: string;
  referenceName: string; 
  isRecycled: boolean; 
  recycledAt: Date; 
  type: 'Customer' | 'Company' | 'ShowRoom';
}
