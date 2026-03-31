import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Clock,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  tx_type: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created_at: string;
}

export default function WalletPage() {
  const { user, isAuthenticated, updateBalance, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setTransactions(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTransactions();
  }, [isAuthenticated, fetchTransactions]);

  const handleDeposit = async () => {
    if (!user || !amount) return;
    setProcessing(true);
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setProcessing(false);
      return;
    }

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      tx_type: "deposit",
      amount: amt,
      description: `Deposited ${amt} KAR`,
    });
    await supabase
      .from("profiles")
      .update({ kar_balance: (user.kar_balance || 0) + amt })
      .eq("id", user.id);
    updateBalance(amt);
    toast.success(`${amt} KAR deposited successfully!`);
    setAmount("");
    setShowDeposit(false);
    setProcessing(false);
    fetchTransactions();
  };

  const handleWithdraw = async () => {
    if (!user || !amount) return;
    setProcessing(true);
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || amt > (user.kar_balance || 0)) {
      toast.error("Insufficient balance or invalid amount");
      setProcessing(false);
      return;
    }

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      tx_type: "withdraw",
      amount: -amt,
      description: `Withdrew ${amt} KAR`,
    });
    await supabase
      .from("profiles")
      .update({ kar_balance: (user.kar_balance || 0) - amt })
      .eq("id", user.id);
    updateBalance(-amt);
    toast.success(`${amt} KAR withdrawn successfully!`);
    setAmount("");
    setShowWithdraw(false);
    setProcessing(false);
    fetchTransactions();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f1219] flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign in to view your wallet
          </h2>
          <p className="text-gray-400 mb-6">
            Create an account to start trading and earning KAR.
          </p>
          <Link
            to="/login"
            className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const txTypeLabel: Record<string, { label: string; color: string }> = {
    deposit: { label: "Deposit", color: "text-emerald-400" },
    withdraw: { label: "Withdraw", color: "text-red-400" },
    trade_reward: { label: "Trade Reward", color: "text-orange-400" },
    referral_bonus: { label: "Referral Bonus", color: "text-purple-400" },
    purchase: { label: "Purchase", color: "text-red-400" },
    swap_in: { label: "Swap In", color: "text-emerald-400" },
    swap_out: { label: "Swap Out", color: "text-red-400" },
  };

  return (
    <div className="min-h-screen bg-[#0f1219] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-emerald-400" /> Wallet
        </h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-emerald-900/40 to-orange-900/20 rounded-2xl border border-emerald-500/20 p-8 mb-6">
          <p className="text-gray-400 text-sm mb-1">Total Balance</p>
          <p className="text-4xl font-bold text-white mb-1">
            {(user?.kar_balance || 0).toFixed(4)}{" "}
            <span className="text-emerald-400 text-xl">KAR</span>
          </p>
          <p className="text-gray-500 text-sm mb-6">
            ≈ ${((user?.kar_balance || 0) * 1.0).toFixed(2)} USD
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeposit(true);
                setShowWithdraw(false);
                setAmount("");
              }}
              className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <ArrowDownLeft className="w-4 h-4" /> Deposit
            </button>
            <button
              onClick={() => {
                setShowWithdraw(true);
                setShowDeposit(false);
                setAmount("");
              }}
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw
            </button>
            <Link
              to="/trade"
              className="px-6 py-3 bg-orange-500/20 text-orange-400 font-semibold rounded-xl hover:bg-orange-500/30 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" /> Trade
            </Link>
          </div>
        </div>

        {/* Deposit/Withdraw Modal */}
        {(showDeposit || showWithdraw) && (
          <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {showDeposit ? "Deposit KAR" : "Withdraw KAR"}
            </h3>
            <div className="flex gap-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={showDeposit ? handleDeposit : handleWithdraw}
                disabled={processing}
                className={`px-6 py-3 font-semibold rounded-xl transition-colors disabled:opacity-50 ${
                  showDeposit
                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
                    : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                }`}
              >
                {processing
                  ? "Processing..."
                  : showDeposit
                    ? "Deposit"
                    : "Withdraw"}
              </button>
              <button
                onClick={() => {
                  setShowDeposit(false);
                  setShowWithdraw(false);
                }}
                className="px-4 py-3 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
            {showDeposit && (
              <div className="flex gap-2 mt-3">
                {[10, 50, 100, 500].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-sm hover:bg-white/10"
                  >
                    {v} KAR
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-4">
            <p className="text-xs text-gray-500">Total Trades</p>
            <p className="text-xl font-bold text-white">
              {user?.total_trades || 0}
            </p>
          </div>
          <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-4">
            <p className="text-xs text-gray-500">Total Earned</p>
            <p className="text-xl font-bold text-emerald-400">
              {(user?.total_earned || 0).toFixed(2)} KAR
            </p>
          </div>
          <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-4">
            <p className="text-xs text-gray-500">Transactions</p>
            <p className="text-xl font-bold text-white">
              {transactions.length}
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[#1a1f2e] rounded-xl border border-gray-800">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              Transaction History
            </h3>
            <button
              onClick={fetchTransactions}
              className="p-2 text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transactions yet. Start trading to earn KAR!
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {transactions.map((tx) => {
                const info = txTypeLabel[tx.tx_type] || {
                  label: tx.tx_type,
                  color: "text-gray-400",
                };
                const isPositive = Number(tx.amount) > 0;
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive ? "bg-emerald-500/20" : "bg-red-500/20"}`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${info.color}`}>
                          {info.label}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {tx.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-mono font-medium ${isPositive ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {isPositive ? "+" : ""}
                        {Number(tx.amount).toFixed(4)} KAR
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
