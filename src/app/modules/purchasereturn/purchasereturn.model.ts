import { Schema, model, Types } from 'mongoose';
import { TPurchaseReturn } from './purchasereturn.interface';

const purchaseReturnSchema = new Schema<TPurchaseReturn>(
  {
    returnDate: {
      type: String,
      required: true,
    },
    // purchaseId: {
    //   type: Types.ObjectId,
    //   ref: 'Purchase',
    //   required: true,
    // },
    referenceNo: {
      type: String,
      required: true,
    },
    // supplier: {
    //   type: Types.ObjectId,
    //   ref: 'Supplier',
    //   required: true,
    // },
    supplierName: {
      type: String,
    },
    warehouse: {
      type: String,
      required: true,
    },
    returnReason: {
      type: String,
      required: true,
    },
    returnNote: {
      type: String,
    },
    purchaseInvoiceNo: {
      type: String,
    },
    items: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productCode: {
          type: String,
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        maxQuantity: {
          type: Number,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          required: true,
        },
        totalAmount: {
          type: Number,
          required: true,
        },
      },
    ],
    totalReturnAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

purchaseReturnSchema.pre('save', function (next) {
  this.totalReturnAmount = this.items.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );
  next();
});

export const PurchaseReturn = model<TPurchaseReturn>('PurchaseReturn', purchaseReturnSchema);
