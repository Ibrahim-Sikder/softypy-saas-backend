export const getMonthName = (month: number) => {
  const date = new Date();
  date.setMonth(month - 1); // JavaScript months are 0-11
  return date.toLocaleString('default', { month: 'long' });
};

export const supplierSearch = [
  'supplierId',
  'name',
  'mobile_number',
  'shop_name',
  'email',
  'address',
  'invoiceNumber',
  'billNumber',
  'against_bill',
  'bill_category',
  'category',
  'amount',
  'billTotal',
  'bill_date',
  'billDate',
  'due_date',
  'dueDate',
  'paid_on',
  'payment_date',
  'paymentDate',
  'payment_against_bill',
  'individual_markup',
];

