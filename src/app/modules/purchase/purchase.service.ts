/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { Purchase } from './purchase.model';
import { purchaseSearch } from './purchase.const';
import { TPurchase } from './purchase.interface';
import mongoose from 'mongoose';
import { Stocks } from '../stocks/stocks.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
const createPurchase = async (payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newPurchase = await Purchase.create([payload], { session });
    for (const item of payload.products) {
      await Stocks.create(
        [
          {
            product: item.productId,
            warehouse: payload.warehouse,
            quantity: item.quantity,
            type: 'in',
            referenceType: 'purchase',
            // referenceId: newPurchase[0]._id,
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
  } catch (error) {
    // ❌ Rollback if any error
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Failed to create purchase and stock',
    );
  }
};

const getAllPurchase = async (query: Record<string, unknown>) => {
  const purchaseQuery = new QueryBuilder(Purchase.find(), query)
    .search(purchaseSearch)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await purchaseQuery.countTotal();
  const purchases = await purchaseQuery.modelQuery.populate([
    {
      path: 'suppliers',
      select: 'full_name',
    },
    {
      path: 'products.productId',
    },
  ]);

  return {
    meta,
    purchases,
  };
};
const getSiniglePurchase = async (id: string) => {
  const result = await Purchase.findById(id).populate([
    {
      path: 'suppliers',
      select: 'full_name',
    },
  ]);
  return result;
};
const updatePurchase = async (id: string, payload: Partial<TPurchase>) => {
  const result = await Purchase.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deletePurchase = async (id: string) => {
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
