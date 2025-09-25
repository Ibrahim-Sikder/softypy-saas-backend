/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { TSupplier } from './supplier.interface';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';

import { getTenantModel } from '../../utils/getTenantModels';
import { generateSupplierId } from './supplier.utils';
import { Types } from 'mongoose';

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
  const { Model: PurchaseReturn } = await getTenantModel(tenantDomain, 'PurchaseReturn');

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
    })
    .populate({
      path: 'purchaseReturn',
      model: PurchaseReturn,
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

  // 🔥 Calculate purchases summary
  const purchasesSummary = supplier.purchases.reduce(
    (acc: any, purchase: any) => {
      acc.totalAmount += purchase.totalAmount || 0;
      acc.totalDiscount += purchase.totalDiscount || 0;
      acc.totalTax += purchase.totalTax || 0;
      acc.totalShipping += purchase.totalShipping || 0;
      acc.grandTotal += purchase.grandTotal || 0;
      acc.paidAmount += purchase.paidAmount || 0;
      acc.dueAmount += purchase.dueAmount || 0;
      acc.shipping += purchase.shipping || 0;
      return acc;
    },
    {
      totalAmount: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalShipping: 0,
      grandTotal: 0,
      paidAmount: 0,
      dueAmount: 0,
      shipping: 0,
    },
  );

  // Return supplier with status summary + purchase summary
  return {
    ...supplier.toObject(),
    orderStatusSummary,
    purchasesSummary,
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

const permanentlyDeleteSupplier = async (tenantDomain: string, id: string) => {
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

export const recordSupplierPayment = async (
  tenantDomain: string,
  payload: {
    supplierId: string;
    amount: number;
    method:
      | "Cash"
      | "Bkash"
      | "Nagad"
      | "Rocket"
      | "Check"
      | "Card"
      | "Bank Transfer"
      | "Other";
    transactionId?: string;
    accountNumber?: string;
    note?: string;
    cardNumber?: string;
    cardHolder?: string;
    expiryDate?: string;
    cvv?: string;
    checkNumber?: string;
    bankName?: string;
    mobileNumber?: string;
  }
) => {
  const { Model: SupplierModel, connection } = await getTenantModel(
    tenantDomain,
    "Supplier"
  );
  const { Model: Purchase } = await getTenantModel(tenantDomain, "Purchase");
  const { Model: PurchaseOrder } = await getTenantModel(
    tenantDomain,
    "PurchaseOrder"
  );

  const session = await connection.startSession();
  session.startTransaction();

  try {
    // Load Supplier
    const supplier = await SupplierModel.findById(payload.supplierId).session(
      session
    );
    if (!supplier) throw new Error("Supplier not found");

    if (payload.amount <= 0) throw new Error("Payment amount must be > 0");
    
    // Check if payment amount exceeds total due
    if (payload.amount > supplier.totalDue) {
      throw new Error("Payment amount exceeds total due amount");
    }

    // Prepare payment data
    const paymentData = {
      amount: payload.amount,
      method: payload.method,
      transactionId: payload.transactionId,
      accountNumber: payload.accountNumber,
      note: payload.note,
      isPartial: payload.amount < supplier.totalDue,
      date: new Date(),
      cardNumber: payload.cardNumber,
      cardHolder: payload.cardHolder,
      expiryDate: payload.expiryDate,
      cvv: payload.cvv,
      checkNumber: payload.checkNumber,
      bankName: payload.bankName,
      mobileNumber: payload.mobileNumber,
    };

    // Save payment into supplier
    supplier.payments.push(paymentData as any);
    await supplier.save({ session });

    // Update Purchases with payment allocation
    let remainingAmount = payload.amount;

    const purchases = await Purchase.find({
      _id: { $in: supplier.purchases as Types.ObjectId[] },
      dueAmount: { $gt: 0 },
    })
      .sort({ date: 1 })
      .session(session);

    for (const purchase of purchases) {
      if (remainingAmount <= 0) break;

      const payToThisPurchase = Math.min(purchase.dueAmount, remainingAmount);
      purchase.paidAmount += payToThisPurchase;
      purchase.dueAmount = purchase.grandTotal - purchase.paidAmount;

      // Update purchase status
      if (purchase.dueAmount === 0) {
        purchase.purchaseStatus = "Paid";
      } else if (purchase.paidAmount > 0) {
        purchase.purchaseStatus = "Partial";
      } else {
        purchase.purchaseStatus = "Unpaid";
      }

      await purchase.save({ session });
      remainingAmount -= payToThisPurchase;
    }

    // Update PurchaseOrders with payment allocation
    const purchaseOrders = await PurchaseOrder.find({
      _id: { $in: supplier.orders as Types.ObjectId[] },
      paymentStatus: { $ne: "Paid" },
    })
      .sort({ orderDate: 1 })
      .session(session);

    for (const order of purchaseOrders) {
      if (remainingAmount <= 0) break;

      const alreadyPaid = (order as any).paidAmount || 0;
      const due = (order.grandTotal || 0) - alreadyPaid;
      const payToThisOrder = Math.min(due, remainingAmount);

      (order as any).paidAmount = alreadyPaid + payToThisOrder;
      const newDue = (order.grandTotal || 0) - (order as any).paidAmount;

      // Update order status
      if (newDue === 0) {
        order.paymentStatus = "Paid";
      } else if ((order as any).paidAmount > 0) {
        order.paymentStatus = "Partial";
      } else {
        order.paymentStatus = "Unpaid";
      }

      await order.save({ session });
      remainingAmount -= payToThisOrder;
    }

    // Recalculate supplier totals
    await reCalcSupplierTotals(tenantDomain, payload.supplierId);

    await session.commitTransaction();
    session.endSession();

    return supplier;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};



export const reCalcSupplierTotals = async (tenantDomain: string, supplierId: string) => {
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');
  const { Model: PurchaseOrder } = await getTenantModel(tenantDomain, 'PurchaseOrder');

  const supplier = await Supplier.findById(supplierId);
  if (!supplier) throw new Error('Supplier not found');

  // Get all active purchases
  const allPurchases = await Purchase.find({
    _id: { $in: supplier.purchases },
    isRecycled: { $ne: true },
  });

  // Calculate totals from purchases
  const totalDueFromPurchases = allPurchases.reduce((sum, p) => sum + (p.dueAmount || 0), 0);
  const totalPaidFromPurchases = allPurchases.reduce((sum, p) => sum + (p.paidAmount || 0), 0);

  // Get all active orders
  const allOrders = await PurchaseOrder.find({
    _id: { $in: supplier.orders },
    isRecycled: { $ne: true },
  });

  // Calculate totals from orders
  const totalDueFromOrders = allOrders.reduce(
    (sum, o) => sum + ((o.grandTotal || 0) - ((o as any).paidAmount || 0)),
    0
  );
  const totalPaidFromOrders = allOrders.reduce((sum, o) => sum + ((o as any).paidAmount || 0), 0);

  // Calculate total payments from supplier's payment records
  const totalPaidFromSupplierPayments = supplier.payments.reduce(
    (sum: number, pay: any) => sum + (pay.amount || 0),
    0
  );

  // IMPORTANT FIX: Calculate total paid as the sum of:
  // 1. Payments applied to purchases
  // 2. Payments applied to orders
  // 3. Direct supplier payments
  // This avoids double-counting
  const totalPaid = totalPaidFromPurchases + totalPaidFromOrders + totalPaidFromSupplierPayments;

  // Calculate total due (remaining amount to be paid)
  const totalDue = totalDueFromPurchases + totalDueFromOrders;

  // Update supplier totals
  supplier.totalDue = totalDue;
  supplier.totalPaid = totalPaid;
  
  // IMPORTANT FIX: Balance should be the net amount owed to supplier
  // If positive: supplier is owed money
  // If negative: supplier owes money (overpayment)
  supplier.balance = totalDue - totalPaid;

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
  permanentlyDeleteSupplier,
  getSupplierWithBillPayments,
  recordSupplierPayment,
  getSupplierPayments,
  reCalcSupplierTotals
};
