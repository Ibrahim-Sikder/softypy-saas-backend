
export interface ISubscription {
    plan: 'Monthly' | 'HalfYearly' | 'Yearly';
    startDate: Date;
    endDate: Date;
    status: 'Active' | 'Expired';
  }
  