import mongoose from "mongoose";
const findLastWarehouseId = async (WarehouseModel: mongoose.Model<any>) => {
  const lastWarehouse = await WarehouseModel.findOne({}, { warehouseId: 1 })
    .sort({ createdAt: -1 })
    .lean<{ warehouseId?: string }>();

  return lastWarehouse?.warehouseId ? lastWarehouse.warehouseId : undefined;
};


export const generateWarehouseId = async (
  WarehouseModel: mongoose.Model<any>
) => {
  const currentId = (await findLastWarehouseId(WarehouseModel)) || "0000";
  const incrementId = (Number(currentId) + 1).toString().padStart(4, "0");
  return incrementId;
};
