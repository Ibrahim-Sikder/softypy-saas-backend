import { Schema, model } from 'mongoose';
import { ICompanyBrand } from './interface';

const companyBrandSchema = new Schema<ICompanyBrand>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String },
  },
  { timestamps: true }
);

export const CompanyBrand = model<ICompanyBrand>('CompanyBrand', companyBrandSchema);
