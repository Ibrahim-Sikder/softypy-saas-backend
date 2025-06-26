import cron from "node-cron"
import { SubscriptionModel } from "../app/modules/subscription/subscription.model"

// প্রতিদিন রাত ১টায় চেক করবে (0 1 * * * = every day at 1 AM)
cron.schedule("0 1 * * *", async () => {
  console.log("🔄 Running subscription expiry checker...")

  const now = new Date()

  try {
    // Find subscriptions that have expired but are still marked as active
    const expiredSubscriptions = await SubscriptionModel.find({
      endDate: { $lt: now },
      isActive: true,
    })

    if (expiredSubscriptions.length > 0) {
      // Update expired subscriptions
      const result = await SubscriptionModel.updateMany(
        {
          endDate: { $lt: now },
          isActive: true,
        },
        {
          $set: {
            status: "Expired",
            isActive: false,
          },
        },
      )

      console.log(`✅ Subscription Expiry Cron: ${result.modifiedCount} subscription(s) marked as expired`)

      // Log expired users for admin notification
      expiredSubscriptions.forEach((sub) => {
        console.log(`📧 User ${sub.user} subscription expired - Plan: ${sub.plan}`)
      })
    } else {
      console.log("✅ No expired subscriptions found")
    }

    // Also check for subscriptions expiring in 3 days (for reminder)
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(now.getDate() + 3)

    const expiringSubscriptions = await SubscriptionModel.find({
      endDate: { $lte: threeDaysFromNow, $gt: now },
      isActive: true,
    }).populate("user", "name email")

    if (expiringSubscriptions.length > 0) {
      console.log(`⚠️ ${expiringSubscriptions.length} subscription(s) expiring in 3 days:`)
      expiringSubscriptions.forEach((sub) => {
        console.log(`📅 User: ${(sub.user as any).name} - Plan: ${sub.plan} - Expires: ${sub.endDate}`)
      })
    }
  } catch (error) {
    console.error("❌ Error in subscription expiry cron job:", error)
  }
})

console.log("⏰ Subscription expiry cron job initialized")
