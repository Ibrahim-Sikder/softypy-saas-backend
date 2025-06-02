import { Customer } from './customer.model';

const findLastCustomerId = async () => {
  const lastCustomer = await Customer.findOne(
    {},
    {
      customerId: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  return lastCustomer?.customerId
    ? lastCustomer?.customerId.substring(6)
    : undefined;
};

export const generateCustomerId = async () => {
  const currentId = (await findLastCustomerId()) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `TAS:01${incrementId}`;
  return incrementId;
};
