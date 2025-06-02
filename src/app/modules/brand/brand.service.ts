/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { Brand } from './brand.model';
import { TBrand } from './brand.interface';
import { brandSearch } from './brand.constant';
import { getTenantModel } from '../../utils/getTenantModels';
const createBrand = async (tenantDomain: string, payload:any) => {
  try {
    
 const { Model: BrandModel } = await getTenantModel(tenantDomain, 'Brand');
     const newBrand = await BrandModel.create(payload);
     return newBrand;
  } catch (error: any) {
    console.error('Error creating brand:', error.message);
    throw new Error(
      error.message || 'An unexpected error occurred while creating the brand',
    );
  }
};

const getAllBrand = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(Brand.find(), query)
    .search(brandSearch)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await categoryQuery.countTotal();
  const brands = await categoryQuery.modelQuery;

  return {
    meta,
    brands,
  };
};
const getSinigleBrand = async (id: string) => {
  const result = await Brand.findById(id);
  return result;
};
const updateBrand = async (id: string, payload: Partial<TBrand>) => {
  const result = await Brand.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteBrand = async (id: string) => {
  const result = await Brand.deleteOne({ _id: id });

  return result;
};

export const brandServices = {
  createBrand,
  getAllBrand,
  getSinigleBrand,
  updateBrand,
  deleteBrand,
};
