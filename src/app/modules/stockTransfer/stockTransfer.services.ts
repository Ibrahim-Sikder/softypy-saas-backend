import StockTransfer from './stockTransfer.model';

const getAllStockTransfers = async () => {
  const transfers = await StockTransfer.find()
    .populate(['product', 'fromWarehouse', 'toWarehouse'])
    .sort({ createdAt: -1 });
  return transfers;
};

const deleteStockTransfer = async (id: string): Promise<{ deleted: boolean }> => {
  const result = await StockTransfer.findByIdAndDelete(id);
  return { deleted: !!result };
};


export const stockTransferServices = {

  getAllStockTransfers,
  deleteStockTransfer,
};
