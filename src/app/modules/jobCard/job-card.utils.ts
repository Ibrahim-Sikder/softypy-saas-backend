import { TCustomer } from '../customer/customer.interface';
import { TVehicle } from '../vehicle/vehicle.interface';
import { JobCard } from './job-card.model';

const findLastJobCardNo = async () => {
  const lastJobCard = await JobCard.findOne(
    {},
    {
      job_no: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  return lastJobCard?.job_no ? lastJobCard?.job_no : undefined;
};

export const generateJobCardNo = async () => {
  const currentId = (await findLastJobCardNo()) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `${incrementId}`;
  return incrementId;
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
