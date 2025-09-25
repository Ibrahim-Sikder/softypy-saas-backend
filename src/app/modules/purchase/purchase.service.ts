/* eslint-disable @typescript-eslint/no-unused-vars */
import QueryBuilder from '../../builder/QueryBuilder';
import { purchaseSearch } from './purchase.const';
import { TPurchase } from './purchase.interface';
import { getTenantModel } from '../../utils/getTenantModels';
import { reCalcSupplierTotals } from '../supplier/supplier.service';

export const createPurchase = async (tenantDomain: string, payload: any) => {
  const { Model: Purchase, connection } = await getTenantModel(
    tenantDomain,
    'Purchase',
  );
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');
  const { Model: Stocks } = await getTenantModel(tenantDomain, 'Stocks');
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');

  const session = await connection.startSession();
  session.startTransaction();

  try {
    const [newPurchase] = await Purchase.create([payload], { session });

    let affectedSuppliers: string[] = [];

    // 🔹 Update suppliers
    if (payload.suppliers?.length) {
      for (const supplierId of payload.suppliers) {
        const supplier = await Supplier.findById(supplierId).session(session);
        if (!supplier) continue;

        if (!supplier.purchases.includes(newPurchase._id)) {
          supplier.purchases.push(newPurchase._id);
        }

        await supplier.save({ session });
        affectedSuppliers.push(supplierId.toString());
      }
    }

    // 🔹 Update stock and product quantities
    if (payload.products?.length) {
      for (const item of payload.products) {
        const productId = item.productId;
        const quantity = Number(item.quantity) || 0;
        const warehouse = payload.warehouse;

        // ✅ query তৈরি
        const query: any = { product: productId, warehouse };
        if (item.batchNumber) query.batchNumber = item.batchNumber;

        const existingStock = await Stocks.findOne(query).session(session);

        if (existingStock) {
          // update existing stock
          existingStock.quantity += quantity;
          await existingStock.save({ session });
        } else {
          // create new stock
          const stockData = {
            product: productId,
            warehouse,
            type: 'in',
            quantity,
            referenceType: 'purchase',
            referenceId: newPurchase._id, // ✅ important
            purchasePrice: Number(item.productPrice) || 0,
            batchNumber: item.batchNumber || undefined,
            expiryDate: item.expiryDate || undefined,
            date: new Date(),
          };

          await Stocks.create([stockData], { session });
        }

        // 🔹 Update product stock quantity
        await Product.findByIdAndUpdate(
          productId,
          { $inc: { stock: quantity } },
          { new: true, session },
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    // 🔹 Recalculate supplier totals after transaction
    for (const supplierId of affectedSuppliers) {
      await reCalcSupplierTotals(tenantDomain, supplierId);
    }

    return newPurchase;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Purchase creation failed:', err);
    throw err;
  }
};


const updatePurchase = async (
  tenantDomain: string,
  id: string,
  payload: Partial<TPurchase>,
) => {
  const { Model: Purchase, connection } = await getTenantModel(
    tenantDomain,
    'Purchase',
  );
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  const session = await connection.startSession();
  session.startTransaction();

  try {
    const purchase = await Purchase.findById(id).session(session);
    if (!purchase) throw new Error('Purchase not found');

    const updated = await Purchase.findByIdAndUpdate(id, payload, {
      new: true,
      session,
    });

    if (updated.suppliers && updated.suppliers.length) {
      for (const supplierId of updated.suppliers) {
        const supplier = await Supplier.findById(supplierId).session(session);
        if (!supplier) continue;

        // Add purchase to supplier's purchases array if not already there
        if (!supplier.purchases.includes(updated._id)) {
          supplier.purchases.push(updated._id);
        }

        await supplier.save({ session });

        // Recalculate supplier totals
        await reCalcSupplierTotals(tenantDomain, supplierId);
      }
    }

    await session.commitTransaction();
    session.endSession();
    return updated;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
export const deletePurchase = async (tenantDomain: string, id: string) => {
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');
  const { Model: Stocks } = await getTenantModel(tenantDomain, 'Stock');
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');
  const { Model: connection } = await getTenantModel(tenantDomain, 'Purchase');

  const session = await connection.startSession();
  session.startTransaction();

  try {
    const purchase = await Purchase.findById(id).session(session);
    if (!purchase) throw new Error('Purchase not found');

    const supplierIds = purchase.suppliers || [];
    const purchasePaidAmount = purchase.paidAmount || 0;
    const purchaseDueAmount = purchase.dueAmount || 0;

    // Remove purchase from supplier's purchases array
    await Supplier.updateMany(
      { _id: { $in: supplierIds } },
      { $pull: { purchases: id } },
      { session },
    );

    // 🔥 নতুন যোগ: স্টক থেকে পণ্যের পরিমাণ বাদ দেওয়া
    if (purchase.products && purchase.products.length) {
      for (const item of purchase.products) {
        const productId = item.productId;
        const quantity = item.quantity || 0;
        const warehouse = purchase.warehouse;

        // স্টক রেকর্ড খুঁজে বের করা
        const existingStock = await Stocks.findOne({
          product: productId,
          warehouse: warehouse,
          batchNumber: item.batchNumber || null,
        }).session(session);

        if (existingStock) {
          // যদি স্টকে পর্যাপ্ত পরিমাণ পণ্য থাকে
          if (existingStock.quantity >= quantity) {
            existingStock.quantity -= quantity;
            await existingStock.save({ session });
          } else {
            throw new Error(
              `স্টকে পর্যাপ্ত পরিমাণ পণ্য নেই। বর্তমান স্টক: ${existingStock.quantity}, বাদ দিতে চাচ্ছেন: ${quantity}`,
            );
          }
        } else {
          throw new Error(`এই পণ্যের জন্য কোনো স্টক রেকর্ড পাওয়া যায়নি`);
        }

        // প্রোডাক্ট ডকুমেন্ট থেকে পণ্যের পরিমাণ বাদ দেওয়া
        await Product.findByIdAndUpdate(
          productId,
          { $inc: { stock: -quantity } },
          { session },
        );
      }
    }

    // পার্চেস ডিলিট করা
    await Purchase.deleteOne({ _id: id }, { session });

    await session.commitTransaction();
    session.endSession();

    // সাপ্লায়ারের টোটাল আবার হিসাব করা
    for (const supplierId of supplierIds) {
      await reCalcSupplierTotals(tenantDomain, supplierId);
    }

    return {
      message: 'Purchase deleted successfully and stock updated',
      removedPaidAmount: purchasePaidAmount,
      removedDueAmount: purchaseDueAmount,
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
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

  // 🔥 calculate totals across all purchases
  const purchaseSummary = purchases.reduce(
    (acc, p) => {
      acc.paidAmount += p.paidAmount || 0;
      acc.dueAmount += p.dueAmount || 0;
      acc.shipping += p.shipping || 0;
      acc.totalAmount += p.totalAmount || 0;
      acc.totalDiscount += p.totalDiscount || 0;
      acc.totalTax += p.totalTax || 0;
      acc.totalShipping += p.totalShipping || 0;
      acc.grandTotal += p.grandTotal || 0;
      return acc;
    },
    {
      paidAmount: 0,
      dueAmount: 0,
      shipping: 0,
      totalAmount: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalShipping: 0,
      grandTotal: 0,
    },
  );

  return {
    meta,
    purchases,
    purchaseSummary,
  };
};

export const getSinglePurchase = async (tenantDomain: string, id: string) => {
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');

  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');
  const { Model: Warehouse } = await getTenantModel(tenantDomain, 'Warehouse');

  const result = await Purchase.findById(id).populate([
    {
      path: 'suppliers',
      model: Supplier,
      select: 'full_name',
    },
    {
      path: 'warehouse',
      model: Warehouse,
      select:'name'
    },
  ]);
  return result;
};

export const purchaseServices = {
  createPurchase,
  getAllPurchase,
  getSinglePurchase,
  updatePurchase,
  deletePurchase,
};
