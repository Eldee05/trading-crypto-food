import { Link } from "react-router-dom";
import {
  Carrot,
  BarChart3,
  Clock,
  Store,
  Users,
  Shield,
  ChefHat,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0f1219]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Carrot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            About Karrotify
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            The world's first food-backed trading platform. Trade agricultural
            commodities, swap perishable tokens, and earn rewards — all powered
            by the KAR ecosystem.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: BarChart3,
                  title: "Trade Coins",
                  desc: "30 commodity coins backed by real agricultural products like Rice (RICE), Beans (BEAN), and Yam (YAMS). Trade them like crypto with dynamic pricing.",
                },
                {
                  icon: Clock,
                  title: "Shell Tokens",
                  desc: "30 perishable shell tokens that expire in 24 hours. Trade Jollof Shell for Fried Rice Shell, or swap to KAR before they expire!",
                },
                {
                  icon: Store,
                  title: "Food Store",
                  desc: "Browse 100+ authentic African dishes. Pay with credit card or KAR. Earn 2% KAR rewards on every purchase.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6"
                >
                  <f.icon className="w-8 h-8 text-emerald-400 mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              The KAR Token
            </h2>
            <div className="bg-gradient-to-r from-emerald-900/30 to-orange-900/20 rounded-2xl border border-emerald-500/20 p-8">
              <p className="text-gray-300 leading-relaxed">
                KAR is the native currency of Karrotify. It's earned through
                trading, referrals, and store purchases. Use KAR to pay for
                food, trade commodities, or withdraw to your bank. Every trade
                earns you KAR rewards, and referring friends gives both parties
                25 KAR bonus.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              Built by DadaShef
            </h2>
            <p className="text-gray-400">
              Karrotify was created by DadaShef (CyberShef) — a visionary who
              believes food should be tradeable, accessible, and rewarding. The
              platform bridges the gap between agriculture, technology, and
              everyday food consumption.
            </p>
          </section>
        </div>

        <div className="text-center mt-16">
          <Link
            to="/login"
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all inline-flex items-center gap-2"
          >
            Join Karrotify <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
