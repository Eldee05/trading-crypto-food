import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0f1219] p-4">
      <div className="max-w-3xl mx-auto py-12">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert max-w-none space-y-6">
          {[
            {
              title: "1. Acceptance of Terms",
              content:
                "By using Karrotify, you agree to these terms. The platform provides food-backed token trading, a food store, and wallet services.",
            },
            {
              title: "2. Account Registration",
              content:
                "You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.",
            },
            {
              title: "3. Trading",
              content:
                "All trades are final once confirmed. Commodity coins and perishable shell tokens are subject to dynamic pricing. Perishable shells expire after 24 hours.",
            },
            {
              title: "4. KAR Token",
              content:
                "KAR is the native platform currency. It can be earned through trading, referrals, and purchases. KAR has no guaranteed exchange rate to fiat currencies.",
            },
            {
              title: "5. Store Purchases",
              content:
                "Food orders are subject to availability. Prices are displayed in USD and KAR equivalent. Free shipping applies to all orders.",
            },
            {
              title: "6. Referral Program",
              content:
                "Each user receives a unique referral code. Both referrer and referee receive 25 KAR when a new user signs up with a valid code.",
            },
            {
              title: "7. Prohibited Activities",
              content:
                "Market manipulation, fraudulent trading, multiple accounts, and any form of abuse are strictly prohibited.",
            },
            {
              title: "8. Limitation of Liability",
              content:
                "Karrotify is not responsible for trading losses, token expiry, or market volatility. Trade at your own risk.",
            },
          ].map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold text-white">{s.title}</h2>
              <p className="text-gray-400 text-sm">{s.content}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs mt-12">
          Last updated: March 2, 2026
        </p>
      </div>
    </div>
  );
}
