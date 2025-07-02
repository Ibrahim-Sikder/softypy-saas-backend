import mongoose, { Schema, model } from "mongoose";
import { TCompanyProfile } from "./companyProfile.interface";

export const companyProfileSchema = new Schema<TCompanyProfile>({
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  whatsapp: { type: String },
  website: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, required: true },
  logo: { type: [String] }, 
});

const CompanyProfile = mongoose.models.CompanyProfile || model("CompanyProfile", companyProfileSchema);
export default CompanyProfile;
