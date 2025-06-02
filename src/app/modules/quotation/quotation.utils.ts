import { Quotation } from './quotation.model';

const findLastQuotationNo = async () => {
  const lastQuotation = await Quotation.findOne(
    {},
    {
      quotation_no: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  return lastQuotation?.quotation_no
    ? lastQuotation?.quotation_no.substring(2)
    : undefined;
};

export const generateQuotationNo = async () => {
  const currentId = (await findLastQuotationNo()) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `Q-${incrementId}`;
  return incrementId;
};


export const formatToIndianCurrency = (amount: number): string => {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};