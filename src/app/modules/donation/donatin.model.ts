import mongoose, { Schema } from 'mongoose';
import { TDonation } from './donation.interface';

const DonationSchema: Schema = new Schema<TDonation>(
  {
    name: { type: String, required: true },
    mobile_number: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    donation_purpose: { type: String, required: true },
    donation_amount: { type: String, required: true },
    donation_country: { type: String, required: true },
    payment_method: { type: String },
    bank_account_no: { type: String },
    check_no: { type: String },
    card_number: { type: String },
    card_holder_name: { type: String },
    card_transaction_no: { type: String },
    card_type: { type: String },
    month_first: { type: String },
    year: { type: String },
    month_second: { type: String },
    security_code: { type: String },
    transaction_no: { type: String },
    transactionId: { type: String },
    description: { type: String },
  },
  { timestamps: true },
);

export const Donation = mongoose.model<TDonation>('Donation', DonationSchema);
