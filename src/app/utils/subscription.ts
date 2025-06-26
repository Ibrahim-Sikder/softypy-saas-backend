import { ISubscription } from "../modules/subscription/subscription.interface"


export const SUBSCRIPTION_PRICES = {
  Monthly: 79,
  HalfYearly: 149 * 6, // 6 months
  Yearly: 299 * 12, // 12 months
}

import { Types } from "mongoose"

export const createSubscription = (
  userId: string,
  plan: "Monthly" | "HalfYearly" | "Yearly",
  isPaid = false,
): Partial<ISubscription> => {
  const startDate = new Date()
  const endDate = new Date()

  // Calculate end date based on plan
  if (plan === "Monthly") {
    endDate.setMonth(startDate.getMonth() + 1)
  } else if (plan === "HalfYearly") {
    endDate.setMonth(startDate.getMonth() + 6)
  } else if (plan === "Yearly") {
    endDate.setFullYear(startDate.getFullYear() + 1)
  }

  const now = new Date()
  const isActive = isPaid && endDate > now
  const status = isPaid ? "Active" : "Pending"
  const user = new Types.ObjectId(userId)
  return {
    // user: user,
    plan,
    startDate,
    endDate,
    status: status as "Active" | "Pending",
    isPaid,
    isActive,
    paymentMethod: "Manual",
    amount: SUBSCRIPTION_PRICES[plan],
  }
}

export const renewSubscription = (
  subscription: ISubscription,
  plan?: "Monthly" | "HalfYearly" | "Yearly",
): Partial<ISubscription> => {
  const currentPlan = plan || subscription.plan
  const startDate = new Date()
  const endDate = new Date()

  if (currentPlan === "Monthly") {
    endDate.setMonth(startDate.getMonth() + 1)
  } else if (currentPlan === "HalfYearly") {
    endDate.setMonth(startDate.getMonth() + 6)
  } else if (currentPlan === "Yearly") {
    endDate.setFullYear(startDate.getFullYear() + 1)
  }

  return {
    plan: currentPlan,
    startDate,
    endDate,
    status: "Active",
    isPaid: true,
    isActive: true,
    amount: SUBSCRIPTION_PRICES[currentPlan],
  }
}

export const checkSubscriptionValidity = (subscription: ISubscription): boolean => {
  const now = new Date()
  return subscription.isPaid && subscription.isActive && subscription.endDate > now
}

export const getDaysRemaining = (endDate: Date): number => {
  const now = new Date()
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}
