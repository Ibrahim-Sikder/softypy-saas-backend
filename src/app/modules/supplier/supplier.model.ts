/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema } from 'mongoose';
import type { TSupplier } from './supplier.interface';

export const supplierSchema: Schema<TSupplier> = new Schema<TSupplier>(
  {
    supplierId: {
      type: String,
    },
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
    },
    phone_number: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    country_code: {
      type: String,
    },
    full_Phone_number: {
      type: String,
    },
    email: {
      type: String,
    },
    vendor: {
      type: String,
    },
    shop_name: {
      type: String,
    },
    business_type: {
      type: String,
    },
    tax_id: {
      type: String,
    },
    registration_number: {
      type: String,
    },
    website: {
      type: String,
    },
    supplier_photo: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postal_code: {
      type: String,
    },
    street_address: {
      type: String,
    },
    delivery_instructions: {
      type: String,
    },
    year_established: {
      type: Number,
    },
    number_of_employees: {
      type: Number,
    },
    annual_revenue: {
      type: Number,
    },
    business_description: {
      type: String,
    },
    bank_name: {
      type: String,
    },
    account_number: {
      type: String,
    },
    swift_code: {
      type: String,
    },
    tax_exempt: {
      type: Boolean,
      default: false,
    },
    tax_exemption_number: {
      type: String,
    },
    credit_terms: {
      type: Boolean,
      default: false,
    },
    payment_terms: {
      type: String,
    },
    credit_limit: {
      type: Number,
    },
    delivery_terms: {
      type: String,
    },
    minimum_order_value: {
      type: Number,
    },
    lead_time: {
      type: Number,
    },
    shipping_method: {
      type: String,
    },
    supply_chain_notes: {
      type: String,
    },
    // supplier_rating: {
    //   type: Number,
    //   // required: [true, 'Supplier rating is required'],
    //   // min: [0, 'Rating must be at least 0'],
    //   // max: [5, 'Rating cannot exceed 5'],
    // },
    supplier_status: {
      type: String,
      enum: ['active', 'pending', 'inactive'],
    },
    quality_certification: {
      type: String,
    },
    notes: {
      type: String,
    },

    isRecycled: {
      type: Boolean,
      default: false,
    },
    recycledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);


supplierSchema.pre('save', function (next) {
  if (this.country_code && this.phone_number) {
    this.full_Phone_number = `${this.country_code}${this.phone_number}`;
  } else {
    this.full_Phone_number = '';
  }
  next();
});

// Pre-update middleware
supplierSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as {
    country_code: any;
    phone_number: any;
    full_Phone_number: string;
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
