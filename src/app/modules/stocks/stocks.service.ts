import mongoose from 'mongoose';
import { IStock } from './stock.interface';
import { Stocks } from './stocks.model';
import StockTransfer from '../stockTransfer/stockTransfer.model';
import { Product } from '../product/product.model';

const createStock = async (payload: IStock): Promise<IStock> => {
  const stock = await Stocks.create(payload);
  return stock;
};


const getAllStocks = async () => {
  const stocks = await Stocks.aggregate([
    // Group by product + warehouse
    {
      $group: {
        _id: {
          product: '$product',
          warehouse: '$warehouse',
        },
        inQuantity: {
          $sum: {
            $cond: [{ $eq: ['$type', 'in'] }, '$quantity', 0],
          },
        },
        outQuantity: {
          $sum: {
            $cond: [{ $eq: ['$type', 'out'] }, '$quantity', 0],
          },
        },
        totalPurchaseValue: {
          $sum: {
            $cond: [{ $eq: ['$type', 'in'] }, { $multiply: ['$quantity', '$purchasePrice'] }, 0],
          },
        },
        totalSellingValue: {
          $sum: {
            $cond: [{ $eq: ['$type', 'in'] }, { $multiply: ['$quantity', '$sellingPrice'] }, 0],
          },
        },
        lastPurchasePrice: { $last: '$purchasePrice' },
        lastSellingPrice: { $last: '$sellingPrice' },
        allPurchasePrices: {
          $push: {
            $cond: [{ $eq: ['$type', 'in'] }, '$purchasePrice', '$$REMOVE'],
          },
        },
        allSellingPrices: {
          $push: {
            $cond: [{ $eq: ['$type', 'in'] }, '$sellingPrice', '$$REMOVE'],
          },
        },
      },
    },

    // Calculate average prices and stock
    {
      $addFields: {
        stock: { $subtract: ['$inQuantity', '$outQuantity'] },
        avgPurchasePrice: {
          $cond: [
            { $gt: [{ $size: '$allPurchasePrices' }, 0] },
            { $avg: '$allPurchasePrices' },
            0,
          ],
        },
        avgSellingPrice: {
          $cond: [
            { $gt: [{ $size: '$allSellingPrices' }, 0] },
            { $avg: '$allSellingPrices' },
            0,
          ],
        },
      },
    },

    // Populate product
    {
      $lookup: {
        from: 'products',
        localField: '_id.product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },

    // Populate warehouse
    {
      $lookup: {
        from: 'warehouses',
        localField: '_id.warehouse',
        foreignField: '_id',
        as: 'warehouse',
      },
    },
    { $unwind: '$warehouse' },

    // Populate nested product fields
    {
      $lookup: {
        from: 'categories',
        localField: 'product.category',
        foreignField: '_id',
        as: 'product.category',
      },
    },
    { $unwind: { path: '$product.category', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'suppliers',
        localField: 'product.suppliers',
        foreignField: '_id',
        as: 'product.suppliers',
      },
    },

    {
      $lookup: {
        from: 'brands',
        localField: 'product.brand',
        foreignField: '_id',
        as: 'product.brand',
      },
    },
    { $unwind: { path: '$product.brand', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'producttypes',
        localField: 'product.product_type',
        foreignField: '_id',
        as: 'product.product_type',
      },
    },
    { $unwind: { path: '$product.product_type', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'units',
        localField: 'product.unit',
        foreignField: '_id',
        as: 'product.unit',
      },
    },
    { $unwind: { path: '$product.unit', preserveNullAndEmptyArrays: true } },
  ]);

  return stocks;
};



const getSingleStock = async (id: string): Promise<IStock | null> => {
  const stock = await Stocks.findById(id).populate(['product', 'warehouse']);
  return stock;
};

const updateStock = async (
  id: string,
  payload: Partial<IStock>,
): Promise<IStock | null> => {
  const updatedStock = await Stocks.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate(['product', 'warehouse']);

  return updatedStock;
};

const deleteStock = async (id: string): Promise<{ deleted: boolean }> => {
  const result = await Stocks.findByIdAndDelete(id);
  return { deleted: !!result };
};

export const calculateCurrentStock = async (
  productId: string,
  warehouseId: string,
  session?: mongoose.ClientSession
): Promise<number> => {
  const result = await Stocks.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        warehouse: new mongoose.Types.ObjectId(warehouseId),
      },
    },
    {
      $group: {
        _id: null,
        totalIn: {
          $sum: {
            $cond: [{ $eq: ['$type', 'in'] }, '$quantity', 0],
          },
        },
        totalOut: {
          $sum: {
            $cond: [{ $eq: ['$type', 'out'] }, '$quantity', 0],
          },
        },
      },
    },
    {
      $project: {
        currentStock: { $subtract: ['$totalIn', '$totalOut'] },
      },
    },
  ]).session(session || null); // use session if provided

  return result[0]?.currentStock || 0;
};

export const transferStock = async (payload: {
  product: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  note?: string;
  batchNumber?: string;
  expiryDate?: Date;
}) => {
  const {
    product,
    fromWarehouse,
    toWarehouse,
    quantity,
    note,
    batchNumber,
    expiryDate,
  } = payload;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentStock = await calculateCurrentStock(product, fromWarehouse, session);
    if (currentStock < quantity) {
      throw new Error('There is not enough stock to transfer.');
    }

    const transferId = new mongoose.Types.ObjectId().toString();

    await Stocks.create(
      [
        {
          product,
          warehouse: fromWarehouse,
          type: 'out',
          quantity,
          referenceType: 'transfer',
          sellingPrice: 0,
          note: `Transfer to warehouse ${toWarehouse}${note ? ` - ${note}` : ''}`,
          batchNumber,
          expiryDate,
          transferId,
        },
        {
          product,
          warehouse: toWarehouse,
          type: 'in',
          quantity,
          referenceType: 'transfer',
          purchasePrice: 0,
          note: `Transferred from warehouse ${fromWarehouse}${note ? ` - ${note}` : ''}`,
          batchNumber,
          expiryDate,
          transferId,
        },
      ],
      { session, runValidators: true }
    );

    const transferRecord = await StockTransfer.create(
      [
        {
          product,
          fromWarehouse,
          toWarehouse,
          quantity,
          transferId,
          batchNumber,
          expiryDate,
          note,
        },
      ],
      { session }
    );

    const newStockInToWarehouse = await calculateCurrentStock(product, toWarehouse, session);
    const newStockInFromWarehouse = await calculateCurrentStock(product, fromWarehouse, session);

    await Product.findByIdAndUpdate(
      product,
      {
        $set: {
          quantity: newStockInFromWarehouse + newStockInToWarehouse, 
        },
      },
      { session }
    );
    await session.commitTransaction();
    return transferRecord[0];
  } catch (error) {
    await session.abortTransaction();
    console.error('স্টক ট্রান্সফার ব্যর্থ হয়েছে:', error);
    throw error;
  } finally {
    session.endSession();
  }
};



export const stockServices = {
  createStock,
  getAllStocks,
  getSingleStock,
  updateStock,
  deleteStock,
  transferStock,
};
