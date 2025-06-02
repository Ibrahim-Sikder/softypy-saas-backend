export const getMonthName = (month: number) => {
  const date = new Date();
  date.setMonth(month - 1); // JavaScript months are 0-11
  return date.toLocaleString('default', { month: 'long' });
};

export const SearchableFields = [
  'expense_for',
  'payment_method',
  'tax',
  'warhouse',
  'name'

];
