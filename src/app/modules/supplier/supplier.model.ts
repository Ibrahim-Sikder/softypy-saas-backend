import mongoose, { Schema } from 'mongoose';
import type { TSupplier } from './supplier.interface';

export const supplierSchema: Schema<TSupplier> = new Schema<TSupplier>(
  {
    supplierId: {
      type: String,
      unique: true,
      index: true,
    },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    orders: [{ type: Schema.Types.ObjectId, ref: 'PurchaseOrder' }],

    full_name: {
      type: String,
      required: [true, 'Supplier name is required'],
    },
    contact_person_name: {
      type: String,
      required: [true, 'Contact person name is required'],
    },
    country_code: String,
    phone_number: String,
    full_Phone_number: String,
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    // Business & Address Information
    vendor: String,
    tax_id: String,
    street_address: String,
    country: String,
    state: String,
    city: String,
    postal_code: String,

    // Financial & Other Details
    bank_name: String,
    account_number: String,
    swift_code: String,
    supplier_status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    notes: String,

    // System Fields
    isRecycled: {
      type: Boolean,
      default: false,
    },
    recycledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// ✅ Auto-generate full phone number before saving
supplierSchema.pre('save', function (next) {
  if (this.country_code && this.phone_number) {
    this.full_Phone_number = `${this.country_code}${this.phone_number}`;
  } else {
    this.full_Phone_number = this.phone_number;
  }
  next();
});

// ✅ Auto-update full phone number on update
supplierSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as {
    country_code?: any;
    phone_number?: any;
    full_Phone_number?: string;
    $set?: Partial<TSupplier>;
  };

  if (update.$set && update.$set.country_code && update.$set.phone_number) {
    update.$set.full_Phone_number = `${update.$set.country_code}${update.$set.phone_number}`;
  } else if (update.country_code && update.phone_number) {
    update.full_Phone_number = `${update.country_code}${update.phone_number}`;
  }

  next();
});

export const Supplier = mongoose.model<TSupplier>('Supplier', supplierSchema);
