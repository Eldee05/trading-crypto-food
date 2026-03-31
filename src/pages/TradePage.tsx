import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import CandlestickChart from "@/components/CandlestickChart";
import { CandleData } from "@/lib/utils";
import { aggregateCandles } from "@/lib/utils";

import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Search,
  RefreshCw,
  ChefHat,
  Send,
  X,
  Clock,
  Flame,
  ArrowRight,
  BarChart3,
  Maximize2,
} from "lucide-react";

interface Token {
  id: string;
  symbol: string;
  name: string;
  token_type: string;
  current_price: number;
  previous_price: number;
  price_change_24h: number;
  volume_24h: number;
  category: string;
  total_supply: number;
  circulating_supply: number;
  expires_at?: string;
}

type Timeframe = "5m" | "15m" | "1h" | "4h" | "1D";

const TIMEFRAME_CONFIG: Record<
  Timeframe,
  { label: string; factor: number; description: string }
> = {
  "5m": { label: "5m", factor: 1, description: "5 minute candles" },
  "15m": { label: "15m", factor: 3, description: "15 minute candles" },
  "1h": { label: "1H", factor: 12, description: "1 hour candles" },
  "4h": { label: "4H", factor: 48, description: "4 hour candles" },
  "1D": { label: "1D", factor: 288, description: "Daily candles" },
};

export default function TradePage() {
  const { user, isAuthenticated, updateBalance } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "commodity_coin" | "perishable_shell"
  >("all");
  const [selected, setSelected] = useState<Token | null>(null);
  const [hoveredToken, setHoveredToken] = useState<Token | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [swapFrom, setSwapFrom] = useState("");
  const [swapTo, setSwapTo] = useState("KAR");
  const [swapAmount, setSwapAmount] = useState("");
  const [swapResult, setSwapResult] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [rawPriceHistory, setRawPriceHistory] = useState<CandleData[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("5m");
  const [chartExpanded, setChartExpanded] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const fetchPrices = useCallback(async () => {
    const { data } = await supabase
      .from("token_prices")
      .select("*")
      .eq("is_active", true)
      .order("volume_24h", { ascending: false });
    if (data) {
      setTokens(data);
      if (!selected && data.length > 0) setSelected(data[0]);
    }
    setLoading(false);
  }, [selected]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  useEffect(() => {
    if (selected) fetchHistory(selected.symbol);
  }, [selected]);

  const fetchHistory = async (symbol: string) => {
    setChartLoading(true);
    const { data } = await supabase
      .from("price_history")
      .select("*")
      .eq("symbol", symbol)
      .order("recorded_at", { ascending: false })
      .limit(288);

    if (data && data.length > 0) {
      const candles: CandleData[] = data.reverse().map((p) => ({
        time: new Date(p.recorded_at).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        timestamp: new Date(p.recorded_at).getTime(),
        open: Number(p.open_price),
        close: Number(p.close_price),
        high: Number(p.high_price),
        low: Number(p.low_price),
        volume: Number(p.volume) || 0,
      }));
      setRawPriceHistory(candles);
    } else {
      setRawPriceHistory([]);
    }
    setChartLoading(false);
  };

  // Aggregate candles based on selected timeframe
  const chartData = useMemo(() => {
    const config = TIMEFRAME_CONFIG[timeframe];
    return aggregateCandles(rawPriceHistory, config.factor);
  }, [rawPriceHistory, timeframe]);

  // Chart stats from visible data
  const chartStats = useMemo(() => {
    if (chartData.length === 0) return null;
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const high = Math.max(...chartData.map((c) => c.high));
    const low = Math.min(...chartData.map((c) => c.low));
    const totalVol = chartData.reduce((s, c) => s + c.volume, 0);
    const change = ((last.close - first.open) / first.open) * 100;
    return { high, low, totalVol, change, candles: chartData.length };
  }, [chartData]);

  const handleSwap = async () => {
    if (!isAuthenticated || !swapAmount || !swapFrom) return;
    const fromToken = tokens.find((t) => t.symbol === swapFrom);
    if (!fromToken) return;
    const amount = parseFloat(swapAmount);
    const karValue = amount * Number(fromToken.current_price);

    await supabase.from("trades").insert({
      user_id: user!.id,
      trade_type: "swap",
      from_symbol: swapFrom,
      to_symbol: swapTo,
      from_amount: amount,
      to_amount: karValue,
      price_at_trade: Number(fromToken.current_price),
      fee: karValue * 0.005,
      kar_reward: karValue * 0.01,
    });

    const reward = karValue * 0.01;
    await supabase
      .from("profiles")
      .update({
        kar_balance: user!.kar_balance + karValue + reward,
        total_trades: (user!.total_trades || 0) + 1,
        total_earned: (user!.total_earned || 0) + reward,
      })
      .eq("id", user!.id);

    updateBalance(karValue + reward);
    setSwapResult(
      `Swapped ${amount} ${swapFrom} for ${karValue.toFixed(2)} KAR + ${reward.toFixed(2)} KAR reward!`,
    );
    setSwapAmount("");

    await supabase.from("notifications").insert({
      user_id: user!.id,
      title: "Trade Completed!",
      message: `You swapped ${amount} ${swapFrom} for ${karValue.toFixed(2)} KAR. Earned ${reward.toFixed(2)} KAR reward!`,
      notification_type: "trade",
    });
  };

  const askAiChef = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setAiInput("");
    setAiLoading(true);

    const { data } = await supabase.functions.invoke("ai-chef", {
      body: { message: userMsg, userId: user?.id },
    });

    setAiMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data?.reply || "Kitchen is busy, try again!",
      },
    ]);
    setAiLoading(false);
    setTimeout(
      () => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight),
      100,
    );
  };

  const filtered = tokens.filter((t) => {
    if (filter !== "all" && t.token_type !== filter) return false;
    if (
      search &&
      !t.symbol.toLowerCase().includes(search.toLowerCase()) &&
      !t.name.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0f1219] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-400" /> Trading Kitchen
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiOpen(true)}
              className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/20 transition-colors flex items-center gap-2 text-sm"
            >
              <ChefHat className="w-4 h-4" /> AI Shef
            </button>
            <button
              onClick={fetchPrices}
              className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Token List */}
          <div
            className={`${chartExpanded ? "hidden lg:block" : ""} lg:col-span-1 bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden`}
          >
            <div className="p-3 border-b border-gray-800">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tokens..."
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-1">
                {(["all", "commodity_coin", "perishable_shell"] as const).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${filter === f ? "bg-emerald-500/20 text-emerald-400" : "text-gray-500 hover:text-white"}`}
                    >
                      {f === "all"
                        ? "All"
                        : f === "commodity_coin"
                          ? "Coins"
                          : "Shells"}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="overflow-y-auto max-h-[700px]">
              {filtered.map((t) => (
                <div
                  key={t.symbol}
                  onClick={() => {
                    setSelected(t);
                    setSwapFrom(t.symbol);
                  }}
                  onMouseEnter={(e) => {
                    setHoveredToken(t);
                    setHoverPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setHoveredToken(null)}
                  className={`flex items-center justify-between p-3 cursor-pointer border-b border-gray-800/30 transition-colors ${
                    selected?.symbol === t.symbol
                      ? "bg-emerald-500/10"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        t.token_type === "perishable_shell"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {t.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <p className="text-xs text-white font-medium">
                        {t.symbol}
                      </p>
                      <p className="text-[10px] text-gray-500">{t.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white font-mono">
                      ${Number(t.current_price).toFixed(2)}
                    </p>
                    <p
                      className={`text-[10px] ${Number(t.price_change_24h) >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {Number(t.price_change_24h) >= 0 ? "+" : ""}
                      {Number(t.price_change_24h).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart & Swap */}
          <div
            className={`${chartExpanded ? "lg:col-span-3" : "lg:col-span-2"} space-y-6`}
          >
            {/* Selected Token Info + Chart */}
            {selected && (
              <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden">
                {/* Token header */}
                <div className="p-4 md:p-6 pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                          selected.token_type === "perishable_shell"
                            ? "bg-orange-500/20 text-orange-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {selected.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {selected.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selected.symbol} / KAR
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white font-mono">
                          ${Number(selected.current_price).toFixed(4)}
                        </p>
                        <p
                          className={`text-sm flex items-center gap-1 justify-end ${Number(selected.price_change_24h) >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {Number(selected.price_change_24h) >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {Number(selected.price_change_24h) >= 0 ? "+" : ""}
                          {Number(selected.price_change_24h).toFixed(2)}%
                        </p>
                      </div>
                      <button
                        onClick={() => setChartExpanded(!chartExpanded)}
                        className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors hidden lg:block"
                        title={
                          chartExpanded ? "Collapse chart" : "Expand chart"
                        }
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Timeframe buttons */}
                  <div className="flex items-center gap-1 mb-3">
                    <BarChart3 className="w-4 h-4 text-gray-500 mr-1" />
                    {(Object.keys(TIMEFRAME_CONFIG) as Timeframe[]).map(
                      (tf) => (
                        <button
                          key={tf}
                          onClick={() => setTimeframe(tf)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            timeframe === tf
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent"
                          }`}
                          title={TIMEFRAME_CONFIG[tf].description}
                        >
                          {TIMEFRAME_CONFIG[tf].label}
                        </button>
                      ),
                    )}
                    <span className="ml-auto text-[10px] text-gray-600">
                      {chartData.length} candles
                    </span>
                  </div>
                </div>

                {/* Candlestick Chart */}
                <div className="px-2 md:px-4">
                  {chartLoading ? (
                    <div className="h-[360px] bg-[#0f1219] rounded-lg flex items-center justify-center">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-400 text-sm">
                          Loading chart...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <CandlestickChart
                      data={chartData}
                      currentPrice={Number(selected.current_price)}
                      symbol={selected.symbol}
                    />
                  )}
                </div>

                {/* Chart stats bar */}
                {chartStats && (
                  <div className="px-4 md:px-6 py-3 border-t border-gray-800/50 flex flex-wrap gap-x-6 gap-y-1">
                    <div>
                      <span className="text-[10px] text-gray-500">
                        Period High{" "}
                      </span>
                      <span className="text-xs text-emerald-400 font-mono">
                        ${chartStats.high.toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500">
                        Period Low{" "}
                      </span>
                      <span className="text-xs text-red-400 font-mono">
                        ${chartStats.low.toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500">Change </span>
                      <span
                        className={`text-xs font-mono ${chartStats.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {chartStats.change >= 0 ? "+" : ""}
                        {chartStats.change.toFixed(2)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500">Volume </span>
                      <span className="text-xs text-white font-mono">
                        {(chartStats.totalVol / 1000).toFixed(1)}K
                      </span>
                    </div>
                  </div>
                )}

                {/* Token Stats */}
                <div className="px-4 md:px-6 py-3 border-t border-gray-800/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500">Volume 24h</p>
                      <p className="text-sm text-white font-mono">
                        {(Number(selected.volume_24h) / 1000).toFixed(1)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Market Cap</p>
                      <p className="text-sm text-white font-mono">
                        $
                        {(
                          (Number(selected.current_price) *
                            Number(selected.circulating_supply)) /
                          1000000
                        ).toFixed(2)}
                        M
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Supply</p>
                      <p className="text-sm text-white font-mono">
                        {(Number(selected.circulating_supply) / 1000).toFixed(
                          0,
                        )}
                        K / {(Number(selected.total_supply) / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Type</p>
                      <p className="text-sm text-white">
                        {selected.token_type === "perishable_shell"
                          ? "Perishable Shell"
                          : "Commodity Coin"}
                      </p>
                    </div>
                  </div>
                </div>

                {selected.token_type === "perishable_shell" &&
                  selected.expires_at && (
                    <div className="mx-4 md:mx-6 mb-4 flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <ExpiryTimer expiresAt={selected.expires_at} />
                    </div>
                  )}
              </div>
            )}

            {/* Swap Panel */}
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-emerald-400" /> Swap to KAR
              </h3>
              {!isAuthenticated ? (
                <p className="text-gray-400 text-sm">
                  Please sign in to start trading.
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      From
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={swapFrom}
                        onChange={(e) => setSwapFrom(e.target.value)}
                        className="flex-1 bg-white/5 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">Select token</option>
                        {tokens.map((t) => (
                          <option key={t.symbol} value={t.symbol}>
                            {t.symbol} - {t.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={swapAmount}
                        onChange={(e) => setSwapAmount(e.target.value)}
                        placeholder="Amount"
                        className="w-32 bg-white/5 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="w-5 h-5 text-gray-500 rotate-90" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">
                      To
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-gray-700 rounded-lg">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-400 to-orange-400 flex items-center justify-center text-[10px] font-bold text-white">
                        K
                      </div>
                      <span className="text-white text-sm font-medium">
                        KAR
                      </span>
                      {swapAmount && swapFrom && (
                        <span className="ml-auto text-emerald-400 font-mono text-sm">
                          ≈{" "}
                          {(
                            parseFloat(swapAmount || "0") *
                            Number(
                              tokens.find((t) => t.symbol === swapFrom)
                                ?.current_price || 0,
                            )
                          ).toFixed(4)}{" "}
                          KAR
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleSwap}
                    disabled={!swapFrom || !swapAmount}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Swap Now
                  </button>
                  {swapResult && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
                      {swapResult}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredToken && (
        <div
          className="fixed z-50 bg-[#1e2538] border border-gray-700 rounded-xl p-4 shadow-2xl w-64 pointer-events-none"
          style={{
            left: Math.min(hoverPos.x + 20, window.innerWidth - 280),
            top: Math.min(hoverPos.y - 50, window.innerHeight - 200),
          }}
        >
          <p className="text-white font-bold text-sm">{hoveredToken.name}</p>
          <p className="text-gray-500 text-xs mb-2">
            {hoveredToken.symbol} | {hoveredToken.category}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Price:</span>{" "}
              <span className="text-white">
                ${Number(hoveredToken.current_price).toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Vol:</span>{" "}
              <span className="text-white">
                {(Number(hoveredToken.volume_24h) / 1000).toFixed(1)}K
              </span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>{" "}
              <span className="text-white">
                {hoveredToken.token_type === "perishable_shell"
                  ? "Shell"
                  : "Coin"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Change:</span>{" "}
              <span
                className={
                  Number(hoveredToken.price_change_24h) >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                }
              >
                {Number(hoveredToken.price_change_24h).toFixed(2)}%
              </span>
            </div>
          </div>
          {hoveredToken.token_type === "commodity_coin" && (
            <p className="text-[10px] text-gray-500 mt-2 border-t border-gray-700 pt-2">
              Farm-to-market commodity. Direct from verified farmers.
            </p>
          )}
        </div>
      )}

      {/* AI Shef Chat */}
      {aiOpen && (
        <div className="fixed bottom-4 right-4 w-96 bg-[#1a1f2e] border border-purple-500/30 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">AI Shef</span>
              <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                Online
              </span>
            </div>
            <button
              onClick={() => setAiOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]"
          >
            {aiMessages.length === 0 && (
              <p className="text-gray-500 text-sm text-center">
                Ask me what's cooking in the market!
              </p>
            )}
            {aiMessages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-emerald-500/20 text-emerald-100"
                      : "bg-purple-500/10 text-gray-300"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 bg-purple-500/10 rounded-xl text-sm text-gray-400">
                  Cooking up insights...
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAiChef()}
                placeholder="What's cooking today?"
                className="flex-1 bg-white/5 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={askAiChef}
                disabled={aiLoading}
                className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpiryTimer({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const update = () =>
      setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return (
    <span className="text-orange-400 text-sm font-mono">
      {h}h {m}m {s}s remaining
    </span>
  );
}
