/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { ImageUpload } from '../../utils/ImageUpload';
import path from 'path';
import { Supplier } from './supplier.model';
import { SearchableFields } from './supplier.const';
import { TSupplier } from './supplier.interface';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { generateSupplierId } from './supplier.utils';
import { BillPay } from '../bill-pay/bill-pay.model';

export const createSupplier = async (
  payload: any,
) => {

  try {
    const supplierId = await generateSupplierId();
    payload.supplierId = supplierId;
    const newSupplier = await Supplier.create(payload);
    return newSupplier;
  } catch (error: any) {
    console.error('Error creating supplier:', error.message);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message ||
        'An unexpected error occurred while creating the supplier',
    );
  }
};

export const getAllSupplier = async (query: Record<string, unknown>) => {
  try {
    const categoryQuery = new QueryBuilder(Supplier.find(), query)
      .search(SearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await categoryQuery.countTotal();
    const suppliers = await categoryQuery.modelQuery;

    return { meta, suppliers };
  } catch (error: any) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching suppliers',
    );
  }
};

export const getSingleSupplier = async (id: string) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }
  return supplier;
};

// In your supplier.service.ts file
export const getSupplierWithBillPayments = async (id: string) => {
  const supplier = await Supplier.findById(id);
  
  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }
  
  // Get bill payments for this supplier
  const billPayments = await BillPay.find({ supplier: id })
    .sort({ createdAt: -1 });
  
  // Calculate payment statistics
  const totalAmount = billPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const paidAmount = billPayments
    .filter(p => p.paymentStatus === 'paid' || p.paymentStatus === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = billPayments
    .filter(p => p.paymentStatus === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  return {
    supplier,
    paymentStats: {
      totalPayments: billPayments.length,
      totalAmount,
      paidAmount,
      pendingAmount,
      pendingCount: billPayments.filter(p => p.paymentStatus === 'pending').length,
    },
    billPayments
  };
};
export const updateSupplier = async (
  id: string,
  payload: Partial<TSupplier>,
) => {
  const updatedSupplier = await Supplier.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updatedSupplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }
  return updatedSupplier;
};

export const permanenatlyDeleteSupplier = async (id: string) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }
  await Supplier.deleteOne({ _id: id });
  return { message: 'Supplier permanently deleted' };
};

export const moveToRecycledbinSupplier = async (id: string) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }

  supplier.isRecycled = true;
  supplier.recycledAt = new Date();
  await supplier.save();
  return supplier;
};

export const restoreFromRecycledSupplier = async (id: string) => {
  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }

  supplier.isRecycled = false;
  await supplier.save();
  return supplier;
};
export const supplierServices = {
  createSupplier,
  getAllSupplier,
  getSingleSupplier,
  updateSupplier,
  moveToRecycledbinSupplier,
  restoreFromRecycledSupplier,
  permanenatlyDeleteSupplier,
  getSupplierWithBillPayments
};
