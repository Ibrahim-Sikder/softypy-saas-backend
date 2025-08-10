/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { purchaseSearch } from './purchase.const';
import { TPurchase } from './purchase.interface';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { getTenantModel } from '../../utils/getTenantModels';

export const createPurchase = async (tenantDomain: string, payload: any) => {
  console.log('tenantDomain:', tenantDomain);
  console.log('payload:', payload);

  const { Model: Purchase, connection: tenantConnection } =
    await getTenantModel(tenantDomain, 'Purchase');

  const { Model: Stocks } = await getTenantModel(tenantDomain, 'Stocks');

  const session = await tenantConnection.startSession();
  session.startTransaction();

  try {
    console.log('Creating Purchase...');
    const newPurchase = await Purchase.create([payload], { session });
    console.log('Purchase Created:', newPurchase[0]);

    const warehouseId = Array.isArray(payload.warehouse)
      ? payload.warehouse[0]
      : payload.warehouse;

    for (const item of payload.products) {
      console.log('Creating Stock for Product:', item.productId);

      await Stocks.create(
        [
          {
            product: item.productId,
            warehouse: warehouseId,
            quantity: item.quantity,
            type: 'in',
            referenceType: 'purchase',
            purchasePrice: item.productPrice,
            batchNumber: item.batchNumber || undefined,
            expiryDate: item.expiryDate || undefined,
            note: payload.note || '',
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    return newPurchase[0];
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error creating purchase/stocks:', error.message);
    console.error('Full error:', error);

    throw new AppError(
      httpStatus.NOT_FOUND,
      'Failed to create purchase and stocks',
    );
  }
};

export const getAllPurchase = async (
  tenantDomain: string,
  query: Record<string, unknown>,
) => {
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');

  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');

  const purchaseQuery = new QueryBuilder(Purchase.find(), query)
    .search(purchaseSearch)
    // .filter()
    // .sort()
    .paginate()
    .fields();

  const meta = await purchaseQuery.countTotal();

  const purchases = await purchaseQuery.modelQuery.populate([
    {
      path: 'suppliers',
      model: Supplier,
      select: 'full_name',
    },
    {
      path: 'products.productId',
      model: Product,
    },
  ]);

  return {
    meta,
    purchases,
  };
};

export const getSiniglePurchase = async (tenantDomain: string, id: string) => {
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');

  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const result = await Purchase.findById(id).populate([
    {
      path: 'suppliers',
      model: Supplier,
      select: 'full_name',
    },
  ]);
  return result;
};

export const updatePurchase = async (
  tenantDomain: string,
  id: string,
  payload: Partial<TPurchase>,
) => {
  console.log(tenantDomain);
  console.log(payload);
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');

  const result = await Purchase.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const deletePurchase = async (tenantDomain: string, id: string) => {
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');

  const result = await Purchase.deleteOne({ _id: id });
  return result;
};

export const purchaseServices = {
  createPurchase,
  getAllPurchase,
  getSiniglePurchase,
  updatePurchase,
  deletePurchase,
};
