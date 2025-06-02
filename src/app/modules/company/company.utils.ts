import { Company } from './company.model';

const findLastCompanyId = async () => {
  const lastCompany = await Company.findOne(
    {},
    {
      companyId: 1,
    },
  )
    .sort({ createdAt: -1 })
    .lean();

  return lastCompany?.companyId
    ? lastCompany?.companyId.substring(6)
    : undefined;
};

export const generateCompanyId = async () => {
  const currentId = (await findLastCompanyId()) || '0000';
  let incrementId = (Number(currentId) + 1).toString().padStart(4, '0');
  incrementId = `TAS:02${incrementId}`;
  return incrementId;
};
