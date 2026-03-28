import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Carrot,
  BarChart3,
  Store,
  Users,
  ChefHat,
  Flame,
} from "lucide-react";

interface TokenPrice {
  symbol: string;
  name: string;
  token_type: string;
  current_price: number;
  price_change_24h: number;
  volume_24h: number;
  category: string;
  expires_at?: string;
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    const { data } = await supabase
      .from("token_prices")
      .select("*")
      .eq("is_active", true)
      .order("volume_24h", { ascending: false });
    if (data) setTokens(data);
    setLoading(false);
  };

  const topGainers = [...tokens]
    .sort((a, b) => Number(b.price_change_24h) - Number(a.price_change_24h))
    .slice(0, 5);
  const topVolume = [...tokens]
    .sort((a, b) => Number(b.volume_24h) - Number(a.volume_24h))
    .slice(0, 5);
  const commodities = tokens
    .filter((t) => t.token_type === "commodity_coin")
    .slice(0, 10);
  const shells = tokens
    .filter((t) => t.token_type === "perishable_shell")
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0f1219]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-[#0f1219] to-orange-900/20" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251,146,60,0.1) 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
                <Flame className="w-3 h-3" /> Live Trading Now
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                Trade Food Like
                <span className="bg-gradient-to-r from-emerald-400 to-orange-400 bg-clip-text text-transparent">
                  {" "}
                  Crypto
                </span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 max-w-lg">
                Swap Jollof for Fried Rice, trade commodity coins, earn KAR
                rewards. The world's first food-backed trading platform with 60
                tokens and 24hr perishable shells.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/trade")}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                >
                  Start Trading <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate("/store")}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                >
                  Browse Store
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-emerald-400" /> Secure
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-orange-400" /> Instant Swaps
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-400" /> 24hr Shells
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-[#1a1f2e] rounded-2xl border border-gray-800 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Live Market</h3>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{" "}
                    Live
                  </span>
                </div>
                <div className="space-y-3">
                  {(loading ? Array(6).fill(null) : topVolume.slice(0, 6)).map(
                    (t, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
                      >
                        {t ? (
                          <>
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                  t.token_type === "perishable_shell"
                                    ? "bg-orange-500/20 text-orange-400"
                                    : "bg-emerald-500/20 text-emerald-400"
                                }`}
                              >
                                {t.symbol.slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm text-white font-medium">
                                  {t.symbol}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {t.name}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-white font-mono">
                                ${Number(t.current_price).toFixed(2)}
                              </p>
                              <p
                                className={`text-[10px] flex items-center gap-0.5 justify-end ${Number(t.price_change_24h) >= 0 ? "text-emerald-400" : "text-red-400"}`}
                              >
                                {Number(t.price_change_24h) >= 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                {Math.abs(Number(t.price_change_24h)).toFixed(
                                  2,
                                )}
                                %
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-8 bg-gray-800/50 rounded animate-pulse" />
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-4 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Tokens",
              value: "60",
              icon: BarChart3,
              color: "emerald",
            },
            {
              label: "Commodity Coins",
              value: "30",
              icon: Carrot,
              color: "green",
            },
            {
              label: "Perishable Shells",
              value: "30",
              icon: Clock,
              color: "orange",
            },
            { label: "Store Items", value: "100+", icon: Store, color: "blue" },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 text-${s.color}-400`} />
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Gainers */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Top Gainers
          </h2>
          <Link
            to="/trade"
            className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {topGainers.map((t) => (
            <Link
              to="/trade"
              key={t.symbol}
              className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-4 hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                    t.token_type === "perishable_shell"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  }`}
                >
                  {t.symbol.slice(0, 3)}
                </div>
                <div>
                  <p className="text-sm text-white font-semibold">{t.symbol}</p>
                  <p className="text-[10px] text-gray-500">{t.name}</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white font-mono">
                ${Number(t.current_price).toFixed(2)}
              </p>
              <p className="text-sm text-emerald-400 font-medium">
                +{Number(t.price_change_24h).toFixed(2)}%
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Commodity Coins */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Carrot className="w-5 h-5 text-emerald-400" /> Commodity Coins
          </h2>
          <Link
            to="/trade"
            className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Trade Now <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
          <div className="grid grid-cols-5 md:grid-cols-7 gap-4 p-3 text-xs text-gray-500 border-b border-gray-800">
            <span className="col-span-2">Token</span>
            <span className="text-right">Price</span>
            <span className="text-right hidden md:block">24h Change</span>
            <span className="text-right hidden md:block">Volume</span>
            <span className="text-right">Category</span>
            <span className="text-right">Action</span>
          </div>
          {commodities.map((t) => (
            <div
              key={t.symbol}
              className="grid grid-cols-5 md:grid-cols-7 gap-4 p-3 items-center border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors"
            >
              <div className="col-span-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  {t.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm text-white font-medium">{t.symbol}</p>
                  <p className="text-[10px] text-gray-500">{t.name}</p>
                </div>
              </div>
              <p className="text-sm text-white font-mono text-right">
                ${Number(t.current_price).toFixed(2)}
              </p>
              <p
                className={`text-sm text-right hidden md:block ${Number(t.price_change_24h) >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {Number(t.price_change_24h) >= 0 ? "+" : ""}
                {Number(t.price_change_24h).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-400 text-right hidden md:block">
                {(Number(t.volume_24h) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 text-right">{t.category}</p>
              <div className="text-right">
                <Link
                  to="/trade"
                  className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                >
                  Trade
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Perishable Shells */}
      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" /> Perishable Shells
            <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
              24hr Expiry
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {shells.map((t) => {
            const expiresAt = t.expires_at
              ? new Date(t.expires_at).getTime()
              : Date.now() + 86400000;
            const remaining = Math.max(0, expiresAt - Date.now());
            const hours = Math.floor(remaining / 3600000);
            const mins = Math.floor((remaining % 3600000) / 60000);
            return (
              <Link
                to="/trade"
                key={t.symbol}
                className="bg-[#1a1f2e] rounded-xl border border-orange-500/20 p-4 hover:border-orange-500/40 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-mono rounded-bl-lg">
                  {hours}h {mins}m
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">
                    {t.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm text-white font-semibold">
                      {t.symbol}
                    </p>
                    <p className="text-[10px] text-gray-500">{t.name}</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-white font-mono">
                  ${Number(t.current_price).toFixed(2)}
                </p>
                <p
                  className={`text-xs ${Number(t.price_change_24h) >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {Number(t.price_change_24h) >= 0 ? "+" : ""}
                  {Number(t.price_change_24h).toFixed(2)}%
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          Why Karrotify?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: BarChart3,
              title: "Real-Time Trading",
              desc: "Trade 30 commodity coins and 30 perishable shells with live pricing powered by our dynamic engine.",
              color: "emerald",
            },
            {
              icon: Clock,
              title: "24hr Perishable Shells",
              desc: "Shells expire in 24 hours - trade them for real food or swap to KAR before time runs out!",
              color: "orange",
            },
            {
              icon: ChefHat,
              title: "AI Shef Assistant",
              desc: "Get market insights from our AI Shef using kitchen terminology. Find what's cooking in the market!",
              color: "blue",
            },
            {
              icon: Store,
              title: "100+ African Foods",
              desc: "Browse and order from our store with 100+ authentic African dishes from across the continent.",
              color: "purple",
            },
            {
              icon: Users,
              title: "Earn & Refer",
              desc: "Earn KAR for every trade. Refer friends and both get 25 KAR bonus instantly.",
              color: "pink",
            },
            {
              icon: Shield,
              title: "Secure Platform",
              desc: "Your funds and trades are secured with enterprise-grade infrastructure and real-time monitoring.",
              color: "cyan",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-${f.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <f.icon className={`w-6 h-6 text-${f.color}-400`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="bg-gradient-to-r from-emerald-900/50 to-orange-900/30 rounded-2xl border border-emerald-500/20 p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join thousands of food traders. Get 10 KAR welcome bonus when you
            sign up.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? "/trade" : "/login")}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all text-lg"
          >
            {isAuthenticated ? "Go to Trading" : "Create Free Account"}
          </button>
        </div>
      </section>
    </div>
  );
}
