export const createSubscription = (
  plan: 'Monthly' | 'HalfYearly' | 'Yearly',
  isPaid = false,
  paymentMethod: 'Manual' | 'Gateway' = 'Manual',
  amount: number = 0
) => {
  const startDate = new Date();
  const endDate = new Date(startDate); 

  if (plan === 'Monthly') endDate.setMonth(endDate.getMonth() + 1);
  else if (plan === 'HalfYearly') endDate.setMonth(endDate.getMonth() + 6);
  else if (plan === 'Yearly') endDate.setFullYear(endDate.getFullYear() + 1);

  const now = new Date();
  const isActive = isPaid && endDate > now;
  const status = isActive ? 'Active' : 'Pending';

  return {
    plan,
    startDate,
    endDate,
    status,
    isPaid,
    isActive,
    paymentMethod,
    amount,
  };
};
