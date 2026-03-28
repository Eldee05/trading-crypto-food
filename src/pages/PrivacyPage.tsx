import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0f1219] p-4">
      <div className="max-w-3xl mx-auto py-12">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="space-y-6">
          {[
            {
              title: "Information We Collect",
              content:
                "We collect your email, name, trading activity, and wallet transactions to provide our services.",
            },
            {
              title: "How We Use Your Data",
              content:
                "Your data is used to process trades, manage your wallet, fulfill store orders, and improve the platform.",
            },
            {
              title: "Data Security",
              content:
                "We use industry-standard encryption and security measures to protect your personal information and trading data.",
            },
            {
              title: "Cookies",
              content:
                "We use localStorage for cart and session management. No third-party tracking cookies are used.",
            },
            {
              title: "Your Rights",
              content:
                "You can request access to, correction of, or deletion of your personal data at any time by contacting support.",
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
