import mongoose from 'mongoose';
import { TCustomer } from '../customer/customer.interface';
import { TVehicle } from '../vehicle/vehicle.interface';

const findLastJobCardNo = async (JobCardModel: mongoose.Model<any>) => {
  const lastJobCard = await JobCardModel.findOne({}, { job_no: 1 })
    .sort({ createdAt: -1 })
    .lean<{ job_no?: string }>();

  return lastJobCard?.job_no ? lastJobCard.job_no : undefined;
};

export const generateJobCardNo = async (JobCardModel: mongoose.Model<any>) => {
  const currentId = (await findLastJobCardNo(JobCardModel)) || '0000';
  const incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  return `${incrementId}`;
};


export const customerKeys: (keyof TCustomer)[] = [
  'customer_name',
  'customer_address',
  'company_name',
  'vehicle_username',
  'company_address',
  'customer_contact',
];

export const vehicleKeys: (keyof TVehicle)[] = [
  'car_registration_no',
  'chassis_no',
  'engine_no',
  'vehicle_brand',
  'vehicle_name',
  'vehicle_model',
  'vehicle_category',
  'color_code',
  'fuel_type',
];

const getMileageData = (vehicle: TVehicle): number[] => {
  return vehicle.mileageHistory.map((entry) => entry.mileage);
};
