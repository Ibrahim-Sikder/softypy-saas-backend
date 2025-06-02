import { Schema, model } from 'mongoose';
import { IStockTransfer } from './stockTransfer.interface';

const stockTransferSchema = new Schema<IStockTransfer>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  fromWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  toWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, required: true },
  transferId: { type: String, required: true },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
   status: {
    type: String,
    enum: ['completed', 'pending', 'transit'],
    default: 'pending',
    required: true,
  },

});

const StockTransfer = model<IStockTransfer>('StockTransfer', stockTransferSchema);
export default StockTransfer;
