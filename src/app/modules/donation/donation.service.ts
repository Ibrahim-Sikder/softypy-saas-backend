import { getTenantModel } from '../../utils/getTenantModels';
import { TDonation } from './donation.interface';

const MODEL_NAME = 'Donation';

export const createDonation = async (tenantDomain: string, payload: TDonation) => {
  const { Model: Donation } = await getTenantModel(tenantDomain, MODEL_NAME as any);
  const result = await Donation.create(payload);
  return result;
};

export const getAllDonation = async (tenantDomain: string) => {
  const { Model: Donation } = await getTenantModel(tenantDomain, MODEL_NAME as any);
  const result = await Donation.find();
  return result;
};

export const getSingleDonation = async (tenantDomain: string, id: string) => {
  const { Model: Donation } = await getTenantModel(tenantDomain, MODEL_NAME as any);
  const result = await Donation.findById(id);
  return result;
};

export const deleteDonation = async (tenantDomain: string, id: string) => {
  const { Model: Donation } = await getTenantModel(tenantDomain, MODEL_NAME as any);
  const result = await Donation.deleteOne({ _id: id });
  return result;
};

export const updateDonation = async (tenantDomain: string, id: string, payload: TDonation) => {
  const { Model: Donation } = await getTenantModel(tenantDomain, MODEL_NAME as any);
  const result = await Donation.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const DonationServices = {
  createDonation,
  getAllDonation,
  getSingleDonation,
  deleteDonation,
  updateDonation,
};
