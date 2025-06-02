import { MoneyReceipt } from "./money-receipt.model";

 

const findLastMoneyReceiptId= async () => {
  const lastMoneyReceipt = await MoneyReceipt.findOne(
    {},
    {
        moneyReceiptId: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  return lastMoneyReceipt?.moneyReceiptId
    ? lastMoneyReceipt?.moneyReceiptId.substring(2)
    : undefined;
};

export const generateMoneyReceiptId = async () => {
  const currentId = (await findLastMoneyReceiptId()) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `M:${incrementId}`;
  return incrementId;
};
