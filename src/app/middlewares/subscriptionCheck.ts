// import type { Request, Response, NextFunction } from "express"
// import { SubscriptionModel } from "../modules/subscription/subscription.model"
// import { checkSubscriptionValidity } from "../utils/subscription"

// declare global {
//   namespace Express {
//     interface User {
//       _id: string
//       email: string
//       name: string
//     }
//     interface Request {
//       user: JwtPayload
//     }
//   }
// }

// export const checkSubscriptionAccess = async (req :Request, res: Response, next: NextFunction) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required",
//       })
//     }

//     const userId = req.user._id
//     const subscription = await SubscriptionModel.findOne({ user: userId })

//     if (!subscription) {
//       return res.status(403).json({
//         success: false,
//         message: "No subscription found. Please subscribe to continue.",
//         code: "NO_SUBSCRIPTION",
//       })
//     }

//     const isValid = checkSubscriptionValidity(subscription)

//     if (!isValid) {
//       // Update subscription status if expired
//       if (subscription.endDate < new Date()) {
//         await SubscriptionModel.findByIdAndUpdate(subscription._id, {
//           status: "Expired",
//           isActive: false,
//         })
//       }

//       return res.status(403).json({
//         success: false,
//         message: "Your subscription has expired or payment is pending. Please renew to continue.",
//         code: "SUBSCRIPTION_EXPIRED",
//         subscription: {
//           plan: subscription.plan,
//           endDate: subscription.endDate,
//           status: subscription.status,
//           isPaid: subscription.isPaid,
//         },
//       })
//     }
//     // Add subscription info to request for use in controllers
//     ;(req as any).subscription = subscription
//     next()
//   } catch (error) {
//     console.error("Subscription check error:", error)
//     res.status(500).json({
//       success: false,
//       message: "Internal server error during subscription check",
//     })
//   }
// }

// // Middleware for admin routes
// export const checkAdminAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "Authentication required" })
//   }

//   // Add your admin check logic here
//   // For example, check if user has admin role
//   // if (req.user.role !== 'admin') {
//   //   return res.status(403).json({ message: 'Admin access required' });
//   // }

//   next()
// }
