/* eslint-disable @typescript-eslint/no-explicit-any */
import QueryBuilder from '../../builder/QueryBuilder';
import { purchaseOrderSearch } from './purchaseorder.constant';
import { TPurchaseOrder } from './purchaseorder.interface';
import { getTenantModel } from '../../utils/getTenantModels';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

export const createPurchaseOrder = async (
  tenantDomain: string,
  payload: any
) => {
  const { Model: PurchaseOrder } = await getTenantModel(
    tenantDomain,
    'PurchaseOrder'
  );
  const { Model: Supplier } = await getTenantModel(tenantDomain, 'Supplier');

  try {
    // Create PurchaseOrder
    const newOrder = await PurchaseOrder.create(payload);

    // Link order to suppliers
    if (payload.suppliers && payload.suppliers.length) {
      await Supplier.updateMany(
        { _id: { $in: payload.suppliers } },
        { $push: { orders: newOrder._id } }
      );
    }

    return newOrder;
  } catch (error: any) {
    console.error('Error creating purchase order:', error.message);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.message || 'An unexpected error occurred while creating the purchase order'
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

export const updatePurchaseOrder = async (
  tenantDomain: string,
  id: string,
  payload: Partial<TPurchaseOrder>,
): Promise<TPurchaseOrder | null> => {
  const isMarkingReceived = payload.status === 'Received';

  const { Model: PurchaseOrder } = await getTenantModel(
    tenantDomain,
    'PurchaseOrder',
  );

  const { Model: Purchase } = await getTenantModel(tenantDomain, 'Purchase');

  const { Model: Stocks } = await getTenantModel(tenantDomain, 'Stock');

  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');

  const updatedOrder = await PurchaseOrder.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedOrder) {
    throw new Error('Purchase Order not found');
  }

  if (isMarkingReceived) {
    // Step 1: Create purchase record
    const purchasePayload = {
      date: new Date().toISOString(),
      referenceNo: updatedOrder.referenceNo.toString(),
      warehouse: updatedOrder.warehouse,
      suppliers: updatedOrder.suppliers,
      shipping: updatedOrder.shipping || 0,
      paymentMethod: updatedOrder.paymentMethod,
      note: updatedOrder.note,
      totalAmount: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalShipping: updatedOrder.shipping || 0,
      grandTotal: updatedOrder.grandTotal || 0,
      purchasStatus: 'Complete',
      products: updatedOrder.products.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        productUnit: item.productUnit,
        discount: item.discount,
        productPrice: item.unit_price,
        tax: item.tax,
        quantity: item.quantity,
      })),
    };

    await Purchase.create(purchasePayload);

    // Step 2: Update Product Stock in Stock collection
    for (const item of updatedOrder.products) {
      const existingStock = await Stocks.findOne({
        product: item.productId,
        warehouse: updatedOrder.warehouse,
        batchNumber: item.batchNumber || null,
      });

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
        await existingStock.save();
      } else {
        await Stocks.create(stockData);
      }

      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { new: true },
      );
    }
  }

  return updatedOrder;
};

export const purchaseOrderServices = {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getSinglePurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
};
