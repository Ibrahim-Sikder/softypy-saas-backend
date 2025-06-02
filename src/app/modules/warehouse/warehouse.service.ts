/* eslint-disable @typescript-eslint/no-explicit-any */

import QueryBuilder from '../../builder/QueryBuilder';
import { warehouseSearchFields } from './warehouse.constant';
import { IWarehouse } from './warehouse.interface';
import Warehouse from './warehouse.model';

const createWarehouse = async (payload: IWarehouse) => {
  try {
    const newWarehouse = await Warehouse.create(payload);
    return newWarehouse;
  } catch (error: any) {
    console.error('Error creating warehouse:', error.message);
    throw new Error(
      error.message || 'An unexpected error occurred while creating the warehouse',
    );
  }
};

const getAllWarehouses = async (query: Record<string, unknown>) => {
  const warehouseQuery = new QueryBuilder(Warehouse.find(), query)
    .search(warehouseSearchFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await warehouseQuery.countTotal();
  const warehouses = await warehouseQuery.modelQuery;

  return {
    meta,
    warehouses,
  };
};

const getSingleWarehouse = async (id: string) => {
  const result = await Warehouse.findById(id);
  return result;
};

const updateWarehouse = async (
  id: string,
  payload: Partial<IWarehouse>,
): Promise<IWarehouse | null> => {

  const updatedWarehouse = await Warehouse.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedWarehouse) {
    throw new Error('Warehouse not found');
  }

  return updatedWarehouse ? updatedWarehouse.toObject() : null;
};

const deleteWarehouse = async (id: string) => {
  const result = await Warehouse.deleteOne({ _id: id });
  return result;
};

export const warehouseServices = {
  createWarehouse,
  getAllWarehouses,
  getSingleWarehouse,
  updateWarehouse,
  deleteWarehouse,
};
