import { ISubscription } from "../subscription/subscription.interface";

export interface ITenant {
  _id?: string;
  name: string;
  businessType: string;
  domain: string;
  dbUri: string;
  subscription: ISubscription;
  isActive: boolean;

  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
}
