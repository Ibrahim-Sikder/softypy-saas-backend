import { Invoice } from './invoice.model';

const findLastInvoiceNo = async () => {
  const lastInvoice = await Invoice.findOne(
    {},
    {
      invoice_no: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  return lastInvoice?.invoice_no
    ? lastInvoice?.invoice_no.substring(2)
    : undefined;
};

export const generateInvoiceNo = async () => {
  const currentId = (await findLastInvoiceNo()) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `I-${incrementId}`;
  return incrementId;
};


export const formatNumberWithCommas = (num: number): string => {
  return num.toLocaleString('en-IN');
};
