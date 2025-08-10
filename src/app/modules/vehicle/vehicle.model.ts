/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Types } from 'mongoose';
import { TVehicle } from './vehicle.interface';

export const vehicleSchema: Schema<TVehicle> = new Schema<TVehicle>(
  {
    Id: {
      type: String,
    },
    carReg_no: {
      type: String,
      required: true,
    },
    user_type: {
      type: String,
      required: true,
    },
    customer: {
      type: Types.ObjectId,
      ref: 'Customer',
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company',
    },
    showRoom: {
      type: Types.ObjectId,
      ref: 'ShowRoom',
    },

    // Vehicle Information
    car_registration_no: {
      type: String,
      required: [true, 'Car registration no is required.'],
    },
    chassis_no: {
      type: String,
      unique: true,
      required: [true, 'Chassis no is required.'],
    },
    engine_no: {
      type: String,
    },
    vehicle_brand: {
      type: String,
    },
    vehicle_name: {
      type: String,
    },
    vehicle_model: {
      type: Number,
    },
    vehicle_category: {
      type: String,
    },
    color_code: {
      type: String,
    },
    mileageHistory: [
      {
        mileage: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    fuel_type: {
      type: String,
    },
    driver_name: {
      type: String,
    },
    driver_country_code: {
      type: String,
    },
    driver_contact: {
      type: String,
    },
    fullRegNum: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to generate full registration number
vehicleSchema.pre('save', function (next) {
  if (this.car_registration_no) {
    this.fullRegNum = this.car_registration_no;
  } else {
    this.fullRegNum = '';
  }
  next();
});

// Pre-update middleware to ensure fullRegNum is updated
vehicleSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as {
    carReg_no?: string;
    fullRegNum?: string;
    $set?: Partial<TVehicle>;
  };

  if (update?.$set?.car_registration_no) {
    update.$set.fullRegNum = update.$set.car_registration_no;
  }

  next();
});

export const Vehicle = mongoose.model<TVehicle>('Vehicle', vehicleSchema);
