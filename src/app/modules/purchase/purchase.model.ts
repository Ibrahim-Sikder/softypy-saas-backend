import mongoose, { Schema, Types } from 'mongoose';
import { TPurchase } from './purchase.interface';

const purchaseSchema: Schema<TPurchase> = new Schema<TPurchase>(
  {
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    referenceNo: {
      type: String,
      required: [true, 'Reference number is required'],
    },
    warehouse: {
       type: Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    attachDocument: {
      type: String,
      required: false,
    },
    suppliers: {
      type: Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    shipping: {
      type: Number,
      required: [true, 'Shipping method is required'],
    },
    note: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
    },
    purchasStatus: {
      type: String,
      enum: ['Incomplete', 'Complete', 'Draft'],
      default: 'Incomplete',
    },

    // 🔽 Newly added fields
    totalAmount: {
      type: Number,
      default: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
    },
    totalShipping: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },

    products: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: {
          type: String,
        },
        productUnit: {
          type: String,
        },
        discount: {
          type: Schema.Types.Mixed,
          default: 0,
        },
        productPrice: {
          type: Schema.Types.Mixed,
        },
        tax: {
          type: Schema.Types.Mixed,
          default: 0,
        },
        quantity: {
          type: Schema.Types.Mixed,
        },
        serialNumber: {
          type: String,
        },
      },
    ],
    
  },
  {
    timestamps: true,
  }
);


export const Purchase = mongoose.model<TPurchase>('Purchase', purchaseSchema);
