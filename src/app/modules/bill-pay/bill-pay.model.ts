import mongoose, { Schema, Document } from 'mongoose';
import { TBillPay } from './bill-pay.interface';

const BillPaySchema: Schema = new Schema<TBillPay>(
  {
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    supplierId: { type: String, required: true },
    name: { type: String, required: true },
    mobile_number: { type: String },
    address: { type: String },
    email: { type: String },
    shop_name: { type: String },
    invoiceNumber: { type: String },
    billNumber: { type: String },
    against_bill: { type: String, required: true },
    bill_category: { type: String },
    category: { type: String },
    amount: { type: Number, required: true },
    billTotal: { type: Number },

    bill_date: { type: Date },
    due_date: { type: Date },
    paid_on: { type: Date },
    payment_date: { type: Date },

    payment_against_bill: { type: String },
    individual_markup: { type: String },
    payment_method: { type: String },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'overdue', 'completed'],
    },
    paymentReference: { type: String },
    payment_terms: { type: String },
    payment_note: { type: String },

    transaction_no: { type: String },
    transactionId: { type: String },

    expense_note: { type: String },
    description: { type: String },

    selected_bank: { type: String },
    bank_name: { type: String },
    bank_account_no: { type: String },
    account_number: { type: String },

    check_no: { type: String },
    check_number: { type: String },
    bkash_number: { type: String },
    transaction_id: { type: String },
    nagad_number: { type: String },
    discount_value: { type: Number },
    payment_status:{type:String},
    card_number: { type: String },
    card_holder_name: { type: String },
    card_transaction_no: { type: String },
    card_type: { type: String },
    expiration_date: { type: String },
    security_code: { type: String },
    cvv: { type: String },

    mobile_payment_provider: { type: String },
    payment_method_name: { type: String },
    tax_rate: { type: String },

    discount_amount: { type: Number },
    discount_type: { type: String, enum: ['percentage', 'fixed'] },
    apply_discount: { type: Boolean },
    tax_amount: { type: Number },

    taxAmount: { type: Number },
    taxRate: { type: Number },
    apply_tax: { type: Boolean },

    is_recurring: { type: Boolean },
    recurring_frequency: { type: String },
    recurring_end_date: { type: Date },

    partial_payment: { type: Boolean },
    partial_amount: { type: Number },
    bill_attachments: { type: String },
  },
  { timestamps: true },
);

export const BillPay = mongoose.model<TBillPay>("BillPay", BillPaySchema);