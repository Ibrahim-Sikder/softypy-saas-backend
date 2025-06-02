import { Types } from 'mongoose';

export interface TVehicle {
  Id: string;
  user_type: string;
  customer?: Types.ObjectId;
  company?: Types.ObjectId;
  showRoom?: Types.ObjectId;
  carReg_no:string;
  car_registration_no: string;
  fullRegNum: string;
  chassis_no: string;
  engine_no: string;
  vehicle_brand: string;
  vehicle_name: string;
  vehicle_model: number;
  vehicle_category: string;
  color_code: string;
  mileageHistory: {
    mileage: number;
    date?: Date;
  }[];
  fuel_type: string;
  driver_name?: string;
  driver_contact?: string;
  driver_country_code?: string;
}
// export interface TVehicle {
//   Id: string;
//   user_type: string;
//   customer?: Types.ObjectId;
//   company?: Types.ObjectId;
//   showRoom?: Types.ObjectId;
//   carReg_no: string;
//   car_registration_no: string;
//   fullRegNum: string;
//   chassis_no: string;
//   engine_no: string;

//   vehicle_brand: string;
//   vehicle_name: string;
//   vehicle_model: number;
//   vehicle_category: string;
//   color_code: string;
//   mileage: number;
//   fuel_type: string;
// }
