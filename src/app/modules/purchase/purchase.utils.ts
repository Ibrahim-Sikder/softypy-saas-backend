import { Purchase } from './purchase.model';

const findLastPurchaseNo = async () => {
  const lastPurchase = await Purchase.findOne(
    {},
    {
      purchase_no: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  return lastPurchase?.referenceNo
    ? lastPurchase?.referenceNo.substring(2)
    : undefined;
};

export const generatePurchaseNo = async () => {
  const currentId = (await findLastPurchaseNo()) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `P-${incrementId}`;
  return incrementId;
};
