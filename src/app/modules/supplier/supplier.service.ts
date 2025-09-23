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

    const supplierQuery = new QueryBuilder(Supplier.find(), query)
      .search(['name'])
      .filter()
      .sort()
      .paginate()
      .fields();
    const meta = await supplierQuery.countTotal();
    const suppliers = await supplierQuery.modelQuery;

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
  const { Model: PurchaseOrder } = await getTenantModel(
    tenantDomain,
    'PurchaseOrder',
  );
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');

  const supplier = await Supplier.findById(id)
    .populate({
      path: 'orders',
      model: PurchaseOrder,
      populate: {
        path: 'products.productId',
        model: Product,
      },
    })
    .populate({
      path: 'products',
      model: Product,
    })
    .populate({
      path: 'purchases',
      model: Purchase,
    });

  if (!supplier) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Supplier not found');
  }

  // 🔥 Calculate order status summary
  const orderStatusSummary: Record<string, number> = {};
  supplier.orders.forEach((order: any) => {
    const status = order.status || 'Unknown';
    orderStatusSummary[status] = (orderStatusSummary[status] || 0) + 1;
  });

  // Return supplier with status summary
  return {
    ...supplier.toObject(),
    orderStatusSummary,
  };
};


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

export const recordSupplierPayment = async (
  tenantDomain: string,
  payload: any,
) => {
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const supplier = await Supplier.findById(payload.supplierId);
  if (!supplier) throw new Error('Supplier not found');

  if (payload.amount <= 0) throw new Error('Payment amount must be > 0');
  if (payload.amount > supplier.balance) throw new Error('Amount > balance');

  const paymentData: any = {
    amount: payload.amount,
    method: payload.method,
    transactionId: payload.transactionId,
    accountNumber: payload.accountNumber,
    note: payload.note,
    isPartial: payload.amount < supplier.balance,
    date: new Date(),
  };

  // Method-specific fields
  switch (payload.method) {
    case 'Card':
      paymentData.cardNumber = payload.cardNumber;
      paymentData.cardHolder = payload.cardHolder;
      paymentData.expiryDate = payload.expiryDate;
      paymentData.cvv = payload.cvv;
      break;
    case 'Check':
      paymentData.checkNumber = payload.checkNumber;
      paymentData.bankName = payload.bankName;
      break;
    case 'Bkash':
    case 'Nagad':
    case 'Rocket':
      paymentData.mobileNumber = payload.mobileNumber;
      if (!payload.transactionId)
        throw new Error('Transaction ID required for mobile payments');
      break;
  }

  // Save payment
  supplier.payments.push(paymentData);

  // Update financials
  supplier.totalPaid += payload.amount;
  supplier.balance = supplier.totalDue - supplier.totalPaid;
  supplier.totalDue = supplier.totalDue - payload.amount;

  await supplier.save();

  return supplier;
};


export const getSupplierPayments = async (
  tenantDomain: string,
  supplierId: string,
) => {
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');
  const supplier = await Supplier.findById(supplierId);

  if (!supplier) throw new Error('Supplier not found');

  return supplier.payments.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
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
  recordSupplierPayment,
  getSupplierPayments,
};
