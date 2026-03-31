import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import {
  User,
  Edit2,
  Save,
  Copy,
  Users,
  Wallet,
  History,
  Shield,
  Flame,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface Referral {
  id: string;
  referee_id: string;
  bonus_amount: number;
  created_at: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    bio: "",
    phone: "",
    location: "",
    spice_level: "medium",
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchReferrals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrer_id", user.id);
    if (data) setReferrals(data);
  }, [user]);

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || "",
        username: user.username || "",
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
        spice_level: user.spice_level || "medium",
      });
      fetchReferrals();
    }
  }, [user, fetchReferrals]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error("Something went wrong");
      }
      setSaving(false);
    }
  };

  const copyReferralCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      toast.success("Referral code copied!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f1219] flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign in to view your profile
          </h2>
          <Link
            to="/login"
            className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl inline-block mt-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const totalReferralEarnings = referrals.reduce(
    (s, r) => s + Number(r.bonus_amount),
    0,
  );

  return (
    <div className="min-h-screen bg-[#0f1219] p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-orange-400 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {user?.display_name?.[0]?.toUpperCase() || "U"}
              </div>
              <h2 className="text-lg font-bold text-white">
                {user?.display_name}
              </h2>
              <p className="text-sm text-gray-500">@{user?.username}</p>
              {user?.is_verified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full mt-2">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">KAR Balance</span>
                <span className="text-emerald-400 font-mono">
                  {(user?.kar_balance || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Trades</span>
                <span className="text-white">{user?.total_trades || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Earned</span>
                <span className="text-orange-400 font-mono">
                  {(user?.total_earned || 0).toFixed(2)} KAR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Spice Level</span>
                <span className="text-white flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  {user?.spice_level}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Link
                to="/wallet"
                className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg text-center hover:bg-emerald-500/30"
              >
                Wallet
              </Link>
              <Link
                to="/orders"
                className="flex-1 py-2 bg-white/5 text-gray-300 text-sm font-medium rounded-lg text-center hover:bg-white/10"
              >
                Orders
              </Link>
            </div>
          </div>

          {/* Edit Profile */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Profile Details
                </h3>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1.5 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 flex items-center gap-1 text-sm"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 flex items-center gap-1 text-sm disabled:opacity-50"
                  >
                    <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "display_name", label: "Display Name" },
                  { key: "username", label: "Username" },
                  { key: "phone", label: "Phone" },
                  { key: "location", label: "Location" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-500 mb-1 block">
                      {f.label}
                    </label>
                    <input
                      value={form[f.key] || ""}
                      disabled={!editing}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                      className={`w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none ${editing ? "focus:border-emerald-500" : "opacity-70"}`}
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">
                    Bio
                  </label>
                  <textarea
                    value={form.bio}
                    disabled={!editing}
                    rows={3}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className={`w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none ${editing ? "focus:border-emerald-500" : "opacity-70"}`}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-2 block items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" /> Preferred
                    Spice Level
                  </label>
                  <div className="flex gap-2">
                    {["mild", "medium", "hot", "fire"].map((s) => (
                      <button
                        key={s}
                        disabled={!editing}
                        onClick={() => setForm({ ...form, spice_level: s })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          form.spice_level === s
                            ? s === "fire"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : s === "hot"
                                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                : s === "medium"
                                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                  : "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-white/5 text-gray-400 border border-gray-700"
                        } ${!editing ? "opacity-70 cursor-not-allowed" : ""}`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Referrals */}
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" /> Referrals
              </h3>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Your Referral Code</p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-bold text-purple-400 font-mono">
                    {user?.referral_code}
                  </code>
                  <button
                    onClick={copyReferralCode}
                    className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/30"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Share this code and both you and your friend get 25 KAR!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Referrals</p>
                  <p className="text-xl font-bold text-white">
                    {referrals.length}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-500">KAR Earned</p>
                  <p className="text-xl font-bold text-purple-400">
                    {totalReferralEarnings.toFixed(0)} KAR
                  </p>
                </div>
              </div>
              {referrals.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Recent Referrals</p>
                  {referrals.slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between py-2 border-b border-gray-800/50"
                    >
                      <span className="text-sm text-gray-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-purple-400">
                        +{Number(r.bonus_amount)} KAR
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
