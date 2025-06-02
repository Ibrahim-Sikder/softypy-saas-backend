import { Donation } from './donatin.model';
import { TDonation } from './donation.interface';

const createDonation = async (payload: TDonation) => {
  const result = Donation.create(payload);
  return result;
};
const getAllDonation = async () => {
  const result = await Donation.find();
  return result;
};
const getSingleDonation = async (id: string) => {
  const result = Donation.findById(id);
  return result;
};
const deleteDonation = async (id: string) => {
  const result = await Donation.deleteOne({ _id: id });
  return result;
};
const updateDonation = async (id: string, payload: TDonation) => {
  const result = await Donation.findByIdAndUpdate({ _id: id }, payload, {
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
