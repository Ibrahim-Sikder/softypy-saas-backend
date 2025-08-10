import mongoose, { Schema } from "mongoose"
import { ISubscription } from "./subscription.interface"

export const subscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",

    },
    plan: {
      type: String,
      enum: ["Monthly", "HalfYearly", "Yearly"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Pending"],
      default: "Active",
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Manual", "Gateway"],
      default: "Manual",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
subscriptionSchema.index({ user: 1, status: 1 })
subscriptionSchema.index({ endDate: 1, isActive: 1 })

export const SubscriptionModel = mongoose.model<ISubscription>("Subscription", subscriptionSchema)
