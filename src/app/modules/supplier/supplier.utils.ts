import { Supplier } from './supplier.model';

const findLastSupplierId = async () => {
  const lastSupplier = await Supplier.findOne(
    {},
    {
      supplierId: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  return lastSupplier?.supplierId
    ? lastSupplier?.supplierId.substring(3)
    : undefined;
};

export const generateSupplierId = async () => {
  const currentId = (await findLastSupplierId()) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `S:1${incrementId}`;
  return incrementId;
};
