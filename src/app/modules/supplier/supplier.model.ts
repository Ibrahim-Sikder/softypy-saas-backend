/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema } from 'mongoose';
import type { TSupplier } from './supplier.interface';

const supplierSchema: Schema<TSupplier> = new Schema<TSupplier>(
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
      required: [true, 'Country code is required'],
    },
    full_Phone_number: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    vendor: {
      type: String,
      required: [true, 'Vendor name is required'],
    },
    shop_name: {
      type: String,
      required: [true, 'Shop name is required'],
    },
    business_type: {
      type: String,
      required: [true, 'Business type is required'],
    },
    tax_id: {
      type: String,
      required: [true, 'Tax ID is required'],
    },
    registration_number: {
      type: String,
      required: [true, 'Registration number is required'],
    },
    website: {
      type: String,
    },
    supplier_photo: {
      type: String,
    },
    country: {
      type: String,
      required: [true, 'Country name is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    postal_code: {
      type: String,
      required: [true, 'Postal code is required'],
    },
    street_address: {
      type: String,
      required: [true, 'Street address is required'],
    },
    delivery_instructions: {
      type: String,
    },
    year_established: {
      type: Number,
      required: [true, 'Year established is required'],
    },
    number_of_employees: {
      type: Number,
      required: [true, 'Number of employees is required'],
    },
    annual_revenue: {
      type: Number,
      required: [true, 'Annual revenue is required'],
    },
    business_description: {
      type: String,
    },
    bank_name: {
      type: String,
      required: [true, 'Bank name is required'],
    },
    account_number: {
      type: String,
      required: [true, 'Account number is required'],
    },
    swift_code: {
      type: String,
      required: [true, 'SWIFT code is required'],
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
      required: [true, 'Payment terms are required'],
    },
    credit_limit: {
      type: Number,
    },
    delivery_terms: {
      type: String,
      required: [true, 'Delivery terms are required'],
    },
    minimum_order_value: {
      type: Number,
      required: [true, 'Minimum order value is required'],
    },
    lead_time: {
      type: Number,
      required: [true, 'Lead time is required'],
    },
    shipping_method: {
      type: String,
    },
    supply_chain_notes: {
      type: String,
    },
    supplier_rating: {
      type: Number,
      required: [true, 'Supplier rating is required'],
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    supplier_status: {
      type: String,
      required: [true, 'Supplier status is required'],
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

// Pre-save middleware to concatenate country_code and phone_number
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
