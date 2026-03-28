import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Carrot, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back, Chef!");
      } else {
        if (!username || !displayName) {
          setError("All fields required");
          setLoading(false);
          return;
        }
        await signup(email, username, displayName, referralCode || undefined);
        toast.success("Welcome to Karrotify! You received 10 KAR!");
      }
      navigate("/");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Unexpected error occurred");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f1219] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-[#1a1f2e] rounded-2xl border border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-orange-400 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Carrot className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {mode === "login" ? "Welcome Back, Chef!" : "Join the Kitchen"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {mode === "login"
                ? "Sign in to your account"
                : "Create your Karrotify account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Display Name
                  </label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    placeholder="DadaShef"
                    className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">
                    Username
                  </label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="dadashef"
                    className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="chef@karrotify.com"
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {mode === "signup" && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Referral Code (optional)
                </label>
                <input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral code for 25 KAR bonus"
                  className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-sm text-emerald-400 hover:text-emerald-300"
            >
              {mode === "login"
                ? "Don't have an account? Sign Up"
                : "Already have an account? Sign In"}
            </button>
          </div>

          {mode === "signup" && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-xs text-emerald-400 text-center">
                Get 10 KAR welcome bonus + 25 KAR with a referral code!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
