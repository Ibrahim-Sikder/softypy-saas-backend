import { NextFunction, Request, Response } from "express";
import { Subscription } from "../modules/subscription/subscription.model";

export const checkSubscriptionAccess = async (req:Request, res:Response, next:NextFunction) => {
  const userId = req.user._id;

  const subscription = await Subscription.findOne({ user: userId });

  const now = new Date();
  if (
    !subscription ||
    !subscription.get('isPaid') ||
    !subscription.get('isActive') ||
    subscription.get('endDate') < now
  ) {
    return res.status(403).json({ message: 'Subscription expired or unpaid. Please renew.' });
  }

  next();
};
