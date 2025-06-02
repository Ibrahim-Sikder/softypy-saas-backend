export const createSubscription = (
  plan: 'Monthly' | 'HalfYearly' | 'Yearly',
) => {
  const startDate = new Date();
  const endDate = new Date();
  if (plan === 'Monthly') endDate.setMonth(startDate.getMonth() + 1);
  else if (plan === 'HalfYearly') endDate.setMonth(startDate.getMonth() + 6);
  else if (plan === 'Yearly') endDate.setFullYear(startDate.getFullYear() + 1);

  return {
    plan,
    startDate,
    endDate,
    status: 'Active',
  };
};
