import QueryBuilder from '../../builder/QueryBuilder';
import { TPurchaseReturn } from './purchasereturn.interface';
import { purchaseReturnSearch } from './purchasereturn.constant';
import mongoose from 'mongoose';
import { getTenantModel } from '../../utils/getTenantModels';

const createPurchaseReturn = async (
  tenantDomain: string,
  payload: TPurchaseReturn,
) => {
  const { Model: PurchaseReturn, connection: tenantConnection } =
    await getTenantModel(tenantDomain, 'PurchaseReturn');

  const session = await tenantConnection.startSession();
  session.startTransaction();

  const { Model: Stocks } = await getTenantModel(tenantDomain, 'Stocks');
  const { Model: StockTransaction } = await getTenantModel(
    tenantDomain,
    'StockTransaction',
  );

  try {
    const newReturn = await PurchaseReturn.create([payload], { session });

    for (const item of payload.items) {
      const stockQuery = {
        product: item.productId,
      };

      const existingStock = await Stocks.findOne(stockQuery).session(session);

      if (!existingStock) {
        throw new Error(
          `Stock not found for product ${item.productName} in warehouse ${payload.warehouse}`,
        );
      }

      if (existingStock.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${item.productName}. Available: ${existingStock.quantity}, Return Quantity: ${item.quantity}`,
        );
      }

      existingStock.quantity -= item.quantity;

      if (existingStock.quantity < 0) {
        throw new Error(
          `Stock quantity for product ${item.productName} cannot be negative`,
        );
      }

      await existingStock.save({ session });

      const stockTransaction = new StockTransaction({
        product: item.productId,
        warehouse: payload.warehouse,
        quantity: item.quantity,
        type: 'out',
        referenceType: 'return',
        purchasePrice: item.unitPrice,
        date: new Date(),
      });

      await stockTransaction.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return newReturn[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Purchase return failed:', error);
    throw error;
  }
};

const getAllPurchaseReturns = async (
  tenantDomain: string,
  query: Record<string, unknown>,
) => {
  const { Model: PurchaseReturn } = await getTenantModel(
    tenantDomain,
    'PurchaseReturn',
  );
  await getTenantModel(tenantDomain, 'Product');
  console.log('purchase return', tenantDomain);

  const builder = new QueryBuilder(PurchaseReturn.find(), query)
    .search(purchaseReturnSearch)
    // .filter()
    // .sort()
    .paginate()
    .fields();

  const meta = await builder.countTotal();
  const data = await builder.modelQuery.populate([{ path: 'items.productId' }]);

  return {
    meta,
    returns: data,
  };
};

const getSinglePurchaseReturn = async (tenantDomain: string, id: string) => {
  const { Model: PurchaseReturn } = await getTenantModel(
    tenantDomain,
    'PurchaseReturn',
  );

  const result = await PurchaseReturn.findById(id).populate([
    { path: 'items.productId' },
  ]);

  return result;
};

const deletePurchaseReturn = async (tenantDomain: string, id: string) => {
  const { Model: PurchaseReturn } = await getTenantModel(
    tenantDomain,
    'PurchaseReturn',
  );

  const result = await PurchaseReturn.deleteOne({ _id: id });
  return result;
};

const updatePurchaseReturn = async (
  tenantDomain: string,
  id: string,
  payload: Partial<TPurchaseReturn>,
) => {
  // ✅ Get PurchaseReturn model and tenant connection
  const {
    Model: PurchaseReturn,
    connection: tenantConnection,
  } = await getTenantModel(tenantDomain, 'PurchaseReturn');

  // ✅ Register other required models
  await getTenantModel(tenantDomain, 'Product'); // required for populate('product')
  const { Model: Stocks } = await getTenantModel(tenantDomain, 'Stocks');
  const { Model: StockTransaction } = await getTenantModel(
    tenantDomain,
    'StockTransaction',
  );

  // ✅ Start session from the tenant's connection
  const session = await tenantConnection.startSession();
  session.startTransaction();

  try {
    const existingReturn = await PurchaseReturn.findById(id).session(session);
    if (!existingReturn) {
      throw new Error('Purchase return not found');
    }

    const oldItemsMap = new Map<string, number>();
    for (const item of existingReturn.items) {
      oldItemsMap.set(item.productId.toString(), item.quantity);
    }

    const newItems = payload.items || existingReturn.items;

    for (const newItem of newItems) {
      const productId = newItem.productId.toString();
      const newQty = newItem.quantity;
      const oldQty = oldItemsMap.get(productId) || 0;
      const diff = newQty - oldQty;

      const stockQuery = {
        product: newItem.productId,
      };

      const stock = await Stocks.findOne(stockQuery)
        .populate('product') // ✅ now safe
        .session(session);

      if (!stock) {
        throw new Error(`Stock not found for product ${newItem.productName}`);
      }

      if (diff > 0 && stock.quantity < diff) {
        throw new Error(
          `Insufficient stock for ${newItem.productName}. Available: ${stock.quantity}, Needed: ${diff}`,
        );
      }

      stock.quantity -= diff;
      await stock.save({ session });

      await StockTransaction.create(
        [
          {
            product: newItem.productId,
            warehouse: payload.warehouse || existingReturn.warehouse,
            quantity: Math.abs(diff),
            type: diff > 0 ? 'out' : 'in',
            referenceType: 'return',
            purchasePrice: newItem.unitPrice,
            date: new Date(),
          },
        ],
        { session },
      );
    }

    const updatedReturn = await PurchaseReturn.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      session,
    });

    await session.commitTransaction();
    session.endSession();
    return updatedReturn;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Update purchase return failed:', error);
    throw error;
  }
};


export const purchaseReturnServices = {
  createPurchaseReturn,
  getAllPurchaseReturns,
  getSinglePurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
};
