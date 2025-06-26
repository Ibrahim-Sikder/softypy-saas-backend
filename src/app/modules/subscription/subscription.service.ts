
export const createSubscription = (
  plan: 'Monthly' | 'HalfYearly' | 'Yearly',
  isPaid = false 
) => {
  const startDate = new Date();
  const endDate = new Date();

  if (plan === 'Monthly') endDate.setMonth(startDate.getMonth() + 1);
  else if (plan === 'HalfYearly') endDate.setMonth(startDate.getMonth() + 6);
  else if (plan === 'Yearly') endDate.setFullYear(startDate.getFullYear() + 1);

  const now = new Date();
  const isActive = isPaid && endDate > now;
  const status = isActive ? 'Active' : 'Expired';

  return {
    plan,
    startDate,
    endDate,
    status,
    isPaid,
    isActive,
  };
};
