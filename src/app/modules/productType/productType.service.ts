/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { ProductType } from './productType.model';
import { productTypeSearch } from './productType.constant';
import { TProductType } from './productType.interface';

const createProductType = async (payload: TProductType) => {
  const result = ProductType.create(payload);
  return result;
};

const getAllProductType = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(ProductType.find(), query)
    .search(productTypeSearch)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await categoryQuery.countTotal();
  const productTypes = await categoryQuery.modelQuery;

  return {
    meta,
    productTypes,
  };
};
const getSinigleProductType = async (id: string) => {
  const result = await ProductType.findById(id);
  return result;
};
const updateProductType = async (
  id: string,
  payload: Partial<TProductType>,
) => {
  const result = await ProductType.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteProductType = async (id: string) => {
  const result = await ProductType.deleteOne({ _id: id });

  return result;
};

export const productTypeServices = {
  createProductType,
  getAllProductType,
  getSinigleProductType,
  updateProductType,
  deleteProductType,
};
