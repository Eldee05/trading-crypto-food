import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Mail, Send } from "lucide-react";
import { toast } from "sonner";

export default function SupportPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#0f1219] p-4">
      <div className="max-w-3xl mx-auto py-12">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-4">Support</h1>
        <p className="text-gray-400 mb-8">
          Need help? Send us a message and we'll get back to you.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <form
            onSubmit={handleSubmit}
            className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6 space-y-4"
          >
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Subject
              </label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Message
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={4}
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>

          <div className="space-y-6">
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-4">FAQ</h3>
              {[
                {
                  q: "What are perishable shells?",
                  a: "Shells are tokens that expire in 24 hours. Trade them for real food or swap to KAR before they expire.",
                },
                {
                  q: "How do I earn KAR?",
                  a: "Trade tokens, refer friends (25 KAR each), and make store purchases (2% reward).",
                },
                {
                  q: "Is my money safe?",
                  a: "Yes, all transactions are secured and your wallet is protected with enterprise-grade security.",
                },
              ].map((f, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <p className="text-sm text-emerald-400 font-medium">{f.q}</p>
                  <p className="text-xs text-gray-400 mt-1">{f.a}</p>
                </div>
              ))}
            </div>
            <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
              <h3 className="text-white font-semibold mb-3">Contact</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400" />{" "}
                  support@karrotify.com
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" /> Live
                  chat available 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
