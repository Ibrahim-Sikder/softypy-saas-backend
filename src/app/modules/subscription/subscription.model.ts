// src/models/schemas/subscription.model.ts
import mongoose, { Schema } from 'mongoose';
import { ISubscription } from './subscription.interface';

export const subscriptionSchema = new Schema<ISubscription>({
  plan: { type: String, enum: ['Monthly', 'HalfYearly', 'Yearly'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Expired'], required: true },
});
