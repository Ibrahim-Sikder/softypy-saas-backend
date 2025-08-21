/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { TSupplier } from './supplier.interface';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';

import { getTenantModel } from '../../utils/getTenantModels';
import { generateSupplierId } from './supplier.utils';

const createSupplier = async (tenantDomain: string, payload: any) => {
  try {
    payload.supplierId = await generateSupplierId();
    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') {
        if (key === 'supplier_status') {
          payload[key] = 'active';
        } else {
          delete payload[key];
        }
      }
    });

    const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');
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

const getAllSupplier = async (
  tenantDomain: string,
  query: Record<string, unknown>,
) => {
  try {
    const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

    const categoryQuery = new QueryBuilder(Supplier.find(), query)
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const meta = await categoryQuery.countTotal();
    const suppliers = await categoryQuery.modelQuery;

    return {
      success: true,
      message: 'Suppliers retrieved successfully',
      meta,
      suppliers,
    };
  } catch (error: any) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching suppliers',
    );
  }
};

const getSingleSupplier = async (tenantDomain: string, id: string) => {
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }

  return supplier;
};

// In your supplier.service.ts file

const getSupplierWithBillPayments = async (
  tenantDomain: string,
  id: string,
) => {
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');
  const { Model: BillPay } = await getTenantModel(tenantDomain, 'BillPay');

  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }

  // Get bill payments for this supplier
  const billPayments = await BillPay.find({ supplier: id }).sort({
    createdAt: -1,
  });

  // Calculate payment statistics
  const totalAmount = billPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const paidAmount = billPayments
    .filter(
      (p) => p.paymentStatus === 'paid' || p.paymentStatus === 'completed',
    )
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = billPayments
    .filter((p) => p.paymentStatus === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    supplier,
    paymentStats: {
      totalPayments: billPayments.length,
      totalAmount,
      paidAmount,
      pendingAmount,
      pendingCount: billPayments.filter((p) => p.paymentStatus === 'pending')
        .length,
    },
    billPayments,
  };
};

const updateSupplier = async (
  tenantDomain: string,
  id: string,
  payload: Partial<TSupplier>,
) => {
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const updatedSupplier = await Supplier.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedSupplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }

  return updatedSupplier;
};

const permanenatlyDeleteSupplier = async (tenantDomain: string, id: string) => {
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }

  await Supplier.deleteOne({ _id: id });

  return { message: 'Supplier permanently deleted' };
};

const moveToRecycledbinSupplier = async (tenantDomain: string, id: string) => {
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const supplier = await Supplier.findById(id);
  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }

  supplier.isRecycled = true;
  supplier.recycledAt = new Date();
  await supplier.save();

  return supplier;
};

export const restoreFromRecycledSupplier = async (
  tenantDomain: string,
  id: string,
) => {
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

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
  getSupplierWithBillPayments,
};
