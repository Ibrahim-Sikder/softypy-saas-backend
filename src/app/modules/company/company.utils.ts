import mongoose from "mongoose";


const findLastCompanyId = async (CompanyModel: mongoose.Model<any>) => {
  const lastCompany = await CompanyModel.findOne(
    {},
    { companyId: 1 }
  )
    .sort({ createdAt: -1 })
    .lean<{ companyId?: string }>();

  return lastCompany?.companyId
    ? lastCompany.companyId.substring(6)
    : undefined;
};

export const generateCompanyId = async (CompanyModel: mongoose.Model<any>) => {
  const currentId = (await findLastCompanyId(CompanyModel)) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `TAS:02${incrementId}`;
  return incrementId;
};
