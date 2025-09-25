import { getTenantModel } from '../../utils/getTenantModels';
import { calculateCurrentStock } from '../stocks/stocks.service';
const getAllStockTransfers = async (tenantDomain: string) => {
  const { Model: StockTransfer } = await getTenantModel(
    tenantDomain,
    'StockTransfer',
  );

  const transfers = await StockTransfer.find()
    .populate(['product', 'fromWarehouse', 'toWarehouse'])
    .sort({ createdAt: -1 });

  return transfers;
};

const deleteStockTransfer = async (
  tenantDomain: string,
  id: string,
): Promise<{ deleted: boolean }> => {
  const { Model: StockTransfer, connection } = await getTenantModel(
    tenantDomain,
    'StockTransfer',
  );
  const { Model: Stocks } = await getTenantModel(tenantDomain, 'Stocks');
  const { Model: StockTransaction } = await getTenantModel(tenantDomain, 'StockTransaction');
  const { Model: Product } = await getTenantModel(tenantDomain, 'Product');

  const session = await connection.startSession();
  session.startTransaction();

  try {
    // Find the stock transfer record
    const stockTransfer = await StockTransfer.findById(id).session(session);
    if (!stockTransfer) {
      await session.abortTransaction();
      session.endSession();
      return { deleted: false };
    }

    // Delete associated stock records
    await Stocks.deleteMany(
      { transferId: stockTransfer.transferId },
      { session }
    );

    // Delete associated stock transaction records
    await StockTransaction.deleteMany(
      { referenceType: 'transfer', referenceId: stockTransfer._id },
      { session }
    );

    // Delete the stock transfer record
    const result = await StockTransfer.deleteOne({ _id: id }, { session });

    // Recalculate product stock after deletion
    const fromWarehouseStock = await calculateCurrentStock(
      tenantDomain,
      stockTransfer.product,
      stockTransfer.fromWarehouse,
      session,
    );
    
    const toWarehouseStock = await calculateCurrentStock(
      tenantDomain,
      stockTransfer.product,
      stockTransfer.toWarehouse,
      session,
    );

    await Product.findByIdAndUpdate(
      stockTransfer.product,
      {
        $set: {
          quantity: fromWarehouseStock + toWarehouseStock,
        },
      },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
    return { deleted: !!result.deletedCount };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('স্টক ট্রান্সফার মুছে ফেলা ব্যর্থ হয়েছে:', error);
    throw error;
  }
};
export const stockTransferServices = {
  getAllStockTransfers,
  deleteStockTransfer,
};
