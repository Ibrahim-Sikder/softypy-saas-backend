import { getTenantModel } from '../../utils/getTenantModels';
const getAllStockTransfers = async (tenantDomain: string) => {
  const { Model: StockTransfer } = await getTenantModel(
    tenantDomain,
    'StockTransfer'
  );

  const transfers = await StockTransfer.find()
    .populate(['product', 'fromWarehouse', 'toWarehouse'])
    .sort({ createdAt: -1 });

  return transfers;
};

// Delete a specific stock transfer by ID
const deleteStockTransfer = async (
  tenantDomain: string,
  id: string
): Promise<{ deleted: boolean }> => {
  const { Model: StockTransfer } = await getTenantModel(
    tenantDomain,
    'StockTransfer'
  );

  const result = await StockTransfer.findByIdAndDelete(id);
  return { deleted: !!result };
};


export const stockTransferServices = {

  getAllStockTransfers,
  deleteStockTransfer,
};
