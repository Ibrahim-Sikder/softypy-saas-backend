/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import { purchaseOrderSearch } from './purchaseorder.constant';
import { TPurchaseOrder } from './purchaseorder.interface';
import { getTenantModel } from '../../utils/getTenantModels';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TPurchase } from '../purchase/purchase.interface';

export const createPurchaseOrder = async (
  tenantDomain: string,
  payload: any,
) => {
  const { Model: PurchaseOrder } = await getTenantModel(
    tenantDomain,
    'PurchaseOrder',
  );
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  try {
    const newOrder = await PurchaseOrder.create(payload);
    if (payload.suppliers && payload.suppliers.length) {
      await Supplier.updateMany(
        { _id: { $in: payload.suppliers } },
        { $push: { orders: newOrder._id } },
      );
    }

    return newOrder;
  } catch (error: any) {
    console.error(error.message);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.message ||
        'An unexpected error occurred while creating the purchase order',
    );
  }
};

export const updatePurchaseOrder = async (
  tenantDomain: string,
  id: string,
  payload: Partial<TPurchaseOrder>,
): Promise<TPurchaseOrder | null> => {
  const isMarkingReceived = payload.status === 'Received';

  const { Model: PurchaseOrder, connection } = await getTenantModel(tenantDomain, 'PurchaseOrder');
  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');
  const { Model: Stocks } = await getTenantModel(tenantDomain, 'Stock');
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  // Start transaction
  const session = await connection.startSession();
  session.startTransaction();

  try {
    // Find existing order
    const existingOrder = await PurchaseOrder.findById(id).session(session);
    if (!existingOrder) {
      throw new AppError(httpStatus.NOT_FOUND, 'Purchase Order not found');
    }

    // Update the purchase order
    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      session,
    });
    if (!updatedOrder) {
      throw new AppError(httpStatus.NOT_FOUND, 'Purchase Order not found after update');
    }

    // Update suppliers if changed
    if (payload.suppliers) {
      // Remove from old suppliers
      await Supplier.updateMany(
        { _id: { $in: existingOrder.suppliers } },
        { $pull: { orders: existingOrder._id } },
        { session },
      );

      // Add to new suppliers
      await Supplier.updateMany(
        { _id: { $in: payload.suppliers } },
        { $addToSet: { orders: updatedOrder._id } },
        { session },
      );
    }

    // If marking as Received → Create Purchase + update Supplier + Stock
    if (isMarkingReceived) {
      const purchasePayload: Partial<TPurchase> = {
        date: new Date(),
        referenceNo: updatedOrder.referenceNo?.toString(),
        warehouse: updatedOrder.warehouse,
        suppliers: updatedOrder.suppliers,
        shipping: updatedOrder.shipping || 0,
        paymentMethod: updatedOrder.paymentMethod,
        note: updatedOrder.note,
        totalAmount: updatedOrder.grandTotal,
        grandTotal: updatedOrder.grandTotal,
        purchaseStatus: 'Received',
        products: updatedOrder.products.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          productUnit: item.productUnit,
          quantity: item.quantity,
          productPrice: item.unit_price,
          discount: item.discount,
          tax: item.tax,
        })),
      };

      const newPurchase = await Purchase.create([purchasePayload], { session });

      // Update supplier totalDue, balance, and link purchase
      if (updatedOrder.suppliers && updatedOrder.suppliers.length > 0) {
        for (const supplierId of updatedOrder.suppliers) {
          const supplier = await Supplier.findById(supplierId).session(session);
          if (!supplier) continue;

          const due = (newPurchase[0].grandTotal || 0) - (newPurchase[0].paidAmount || 0);
          supplier.totalDue = (supplier.totalDue || 0) + due;
          supplier.balance = (supplier.totalDue || 0) - (supplier.totalPaid || 0);

          if (!supplier.purchases.includes(newPurchase[0]._id)) {
            supplier.purchases.push(newPurchase[0]._id);
          }

          await supplier.save({ session });
        }
      }

      // Update stock + product quantities
      for (const item of updatedOrder.products) {
        const existingStock = await Stocks.findOne({
          product: item.productId,
          warehouse: updatedOrder.warehouse,
          batchNumber: item.batchNumber || null,
        }).session(session);

        const stockData = {
          product: item.productId,
          warehouse: updatedOrder.warehouse,
          quantity: item.quantity,
          batchNumber: item.batchNumber || null,
          expiryDate: null,
          type: 'in',
          referenceType: 'purchase',
          purchasePrice: item.unit_price,
          date: new Date(),
        };

        if (existingStock) {
          existingStock.quantity += item.quantity;
          await existingStock.save({ session });
        } else {
          await Stocks.create([stockData], { session });
        }

        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } },
          { new: true, session },
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return updatedOrder;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.message || 'An unexpected error occurred while updating the purchase order',
    );
  }
};



const getAllPurchaseOrders = async (
  tenantDomain: string,
  query: Record<string, unknown>,
) => {
  const { Model: PurchaseOrder } = await getTenantModel(
    tenantDomain,
    'PurchaseOrder',
  );
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');

  const purchaseOrderQuery = new QueryBuilder(PurchaseOrder.find(), query)
    .search(purchaseOrderSearch)
    // .filter()
    // .sort()
    .paginate()
    .fields();

  const meta = await purchaseOrderQuery.countTotal();

  const orders = await purchaseOrderQuery.modelQuery.populate([
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
    orders,
  };
};

const getSinglePurchaseOrder = async (tenantDomain: string, id: string) => {
  const { Model: PurchaseOrder } = await getTenantModel(
    tenantDomain,
    'PurchaseOrder',
  );
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');
  const { Model: Warehouse } = await getTenantModel(tenantDomain, 'Warehouse');

  const result = await PurchaseOrder.findById(id).populate([
    {
      path: 'suppliers',
      model: Supplier,
      select: 'full_name',
    },
    {
      path: 'warehouse',
      model: Warehouse,
      select: 'name',
    },
  ]);

  return result;
};

const deletePurchaseOrder = async (tenantDomain: string, id: string) => {
  const { Model: PurchaseOrder } = await getTenantModel(
    tenantDomain,
    'PurchaseOrder',
  );

  const result = await PurchaseOrder.deleteOne({ _id: id });
  return result;
};




export const purchaseOrderServices = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getSinglePurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
