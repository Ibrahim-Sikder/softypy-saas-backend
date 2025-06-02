/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { Product } from '../product/product.model';
import { Purchase } from '../purchase/purchase.model';
import { purchaseOrderSearch } from './purchaseorder.constant';
import { TPurchaseOrder } from './purchaseorder.interface';
import { PurchaseOrder } from './purchaseorder.model';
import { Stocks } from '../stocks/stocks.model';

const createPurchaseOrder = async (
  payload: any,
  file?: Express.Multer.File,
) => {
  try {
    const newOrder = await PurchaseOrder.create(payload);
    return newOrder;
  } catch (error: any) {
    console.error('Error creating purchase order:', error.message);
    throw new Error(
      error.message ||
        'An unexpected error occurred while creating the purchase order',
    );
  }
};

const getAllPurchaseOrders = async (query: Record<string, unknown>) => {
  const purchaseOrderQuery = new QueryBuilder(PurchaseOrder.find(), query)
    .search(purchaseOrderSearch)
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await purchaseOrderQuery.countTotal();
  const orders = await purchaseOrderQuery.modelQuery.populate([
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
    orders,
  };
};

const getSinglePurchaseOrder = async (id: string) => {
  const result = await PurchaseOrder.findById(id).populate([
    {
      path: 'suppliers',
      select: 'full_name',
    },
    {
      path: 'warehouse',
      select: 'name',
    },
  ]);
  return result;
};


export const updatePurchaseOrder = async (
  id: string,
  payload: Partial<TPurchaseOrder>
): Promise<TPurchaseOrder | null> => {
  const isMarkingReceived = payload.status === 'Received';


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
      products: updatedOrder.products.map((item) => ({
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
    purchasePrice: item.unit_price, // required if type is 'in'
    date: new Date(),
  };

  if (existingStock) {
    // Update existing stock quantity
    existingStock.quantity += item.quantity;
    await existingStock.save();
  } else {
    // Create new stock entry with required fields
    await Stocks.create(stockData);
  }

  // Also update Product model stock
  await Product.findByIdAndUpdate(
    item.productId,
    { $inc: { stock: item.quantity } },
    { new: true }
  );
}


  }

  return updatedOrder;
};
const deletePurchaseOrder = async (id: string) => {
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
