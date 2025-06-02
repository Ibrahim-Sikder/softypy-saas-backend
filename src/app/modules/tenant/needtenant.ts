// // interfaces/user.interface.ts
// export interface IUser {
//     _id?: string;
//     name: string;
//     email: string;
//     password: string;
//     role: 'Admin' | 'User';
//     tenantId: string;
//   }
  
//   // interfaces/tenant.interface.ts
//   export interface ITenant {
//     _id?: string;
//     name: string;
//     domain: string; 
//     dbUri: string;
//     subscription: ISubscription;
//     isActive: boolean;
//   }
  
//   export interface ISubscription {
//     plan: 'Monthly' | 'HalfYearly' | 'Yearly';
//     startDate: Date;
//     endDate: Date;
//     status: 'Active' | 'Expired';
//   }
  
//   // models/user.model.ts
//   import mongoose, { Schema } from 'mongoose';
//   import { IUser } from '../interfaces/user.interface';
  
//   const userSchema = new Schema<IUser>({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, enum: ['Admin', 'User'], required: true },
//     tenantId: { type: String, required: true },
//   });
  
//   userSchema.statics.isUserExistsByCustomId = async function (value: string) {
//     return this.findOne({ $or: [{ email: value }, { name: value }] });
//   };
  
//   export const User = mongoose.model<IUser>('User', userSchema);
  
//   // models/tenant.model.ts
//   import { ITenant } from '../interfaces/tenant.interface';
//   const tenantSchema = new Schema<ITenant>({
//     name: { type: String, required: true },
//     domain: { type: String, required: true },
//     dbUri: { type: String, required: true },
//     subscription: { 
//       plan: { type: String, enum: ['Monthly', 'HalfYearly', 'Yearly'], required: true },
//       startDate: { type: Date, required: true },
//       endDate: { type: Date, required: true },
//       status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
//     },
//     isActive: { type: Boolean, default: true },
//   });
  
//   export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);
  
//   // services/tenant.service.ts
//   import bcrypt from 'bcrypt';
//   import { Tenant } from '../models/tenant.model';
//   import { User } from '../models/user.model';
//   import { createSubscription } from '../utils/subscription';
//   import AppError from '../errors/AppError';
  
//   export const TenantServices = {
//     createTenant: async (payload: any, plan: 'Monthly' | 'HalfYearly' | 'Yearly') => {
//       const { name, domain, adminUser } = payload;
      
//       const dbUri = `mongodb://localhost:27017/${domain.replace('.', '_')}`;
//       const subscription = createSubscription(plan);
  
//       const tenant = new Tenant({ name, domain, dbUri, subscription, isActive: true });
//       await tenant.save();
  
//       const hashedPassword = await bcrypt.hash(adminUser.password, 10);
//       const admin = new User({
//         ...adminUser,
//         password: hashedPassword,
//         role: 'Admin',
//         tenantId: tenant._id,
//       });
//       await admin.save();
  
//       return { tenant, admin };
//     },
//   };
  
//   // utils/subscription.ts
//   export const createSubscription = (plan: 'Monthly' | 'HalfYearly' | 'Yearly') => {
//     const startDate = new Date();
//     const endDate = new Date();
  
//     if (plan === 'Monthly') endDate.setMonth(startDate.getMonth() + 1);
//     else if (plan === 'HalfYearly') endDate.setMonth(startDate.getMonth() + 6);
//     else if (plan === 'Yearly') endDate.setFullYear(startDate.getFullYear() + 1);
  
//     return { plan, startDate, endDate, status: 'Active' };
//   };
  
//   // controllers/tenant.controller.ts
//   import httpStatus from 'http-status';
//   import { TenantServices } from '../services/tenant.service';
//   import catchAsync from '../utils/catchAsync';
//   import sendResponse from '../utils/sendResponse';
  
//   const createTenant = catchAsync(async (req, res) => {
//     const { plan } = req.body;
  
//     if (!['Monthly', 'HalfYearly', 'Yearly'].includes(plan)) {
//       throw new Error('Invalid subscription plan. Choose Monthly, HalfYearly, or Yearly.');
//     }
  
//     const result = await TenantServices.createTenant(req.body, plan);
  
//     sendResponse(res, {
//       statusCode: httpStatus.CREATED,
//       success: true,
//       message: 'Tenant and Admin created successfully',
//       data: result,
//     });
//   });
  
//   export const TenantController = { createTenant };
  
//   // routes/tenant.route.ts
//   import express from 'express';
//   import { TenantController } from '../controllers/tenant.controller';
  
//   const router = express.Router();
  
//   router.post('/create', TenantController.createTenant);
  
//   export default router;
  