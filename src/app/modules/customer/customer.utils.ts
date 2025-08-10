import mongoose from "mongoose";

const findLastCustomerId = async (CustomerModel: mongoose.Model<any>) => {
  const lastCustomer = await CustomerModel.findOne({}, { customerId: 1 })
    .sort({ createdAt: -1 })
    .lean() as { customerId?: string } | null;

  return lastCustomer?.customerId
    ? lastCustomer.customerId.substring(6)
    : undefined;
};

export const generateCustomerId = async (
  CustomerModel: mongoose.Model<any>
) => {
  const currentId = (await findLastCustomerId(CustomerModel)) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `TAS:01${incrementId}`;
  return incrementId;
};
