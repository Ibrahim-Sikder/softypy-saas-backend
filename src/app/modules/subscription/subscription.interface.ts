import { ObjectId } from "mongoose"

export interface ISubscription {
  _id?: string
  user: ObjectId
  plan: "Monthly" | "HalfYearly" | "Yearly"
  startDate: Date
  endDate: Date
  status: "Active" | "Expired" | "Pending"
  isPaid: boolean
  isActive: boolean
  paymentMethod: "Manual" | "Gateway"
  amount: number
  createdAt?: Date
  updatedAt?: Date
}

export interface IUser {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
}

export interface SubscriptionStats {
  totalActive: number
  totalExpired: number
  totalPending: number
  monthlyRevenue: number
}
