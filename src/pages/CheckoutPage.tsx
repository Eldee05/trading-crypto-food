import { useState, useEffect } from "react";
import { PaymentIntent } from "@stripe/stripe-js";
import { Stripe } from "@stripe/stripe-js";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Lock,
  ShoppingCart,
  Flame,
  CreditCard,
  Coins,
} from "lucide-react";

const stripePromise: Promise<Stripe | null> | null = null; // Stripe not yet connected
//const stripePromise = loadStripe("your_key");

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated, updateBalance } = useAuth();
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState<"card" | "kar">("card");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [shipping, setShipping] = useState({
    name: user?.display_name || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "Nigeria",
  });
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (items.length === 0 && !orderComplete) navigate("/cart");
  }, [items, orderComplete, navigate]);

  const createPaymentIntent = async () => {
    if (subtotal <= 0) return;
    const { data, error } = await supabase.functions.invoke(
      "create-payment-intent",
      {
        body: {
          amount: subtotal,
          currency: "usd",
          metadata: { store: "karrotify" },
        },
      },
    );
    if (error || !data?.clientSecret) {
      setPaymentError("Unable to initialize payment. Please try again.");
      return;
    }
    setClientSecret(data.clientSecret);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !shipping.name ||
      !shipping.email ||
      !shipping.address ||
      !shipping.city
    )
      return;
    setStep("payment");
    if (payMethod === "card") createPaymentIntent();
  };

  const createOrder = async (paymentIntentId?: string) => {
    const karReward = (subtotal * 0.02) / 100; // 2% KAR reward

    let customerId = user?.id;
    if (user) {
      const { data: customer } = await supabase
        .from("ecom_customers")
        .upsert(
          { email: shipping.email, name: shipping.name },
          { onConflict: "email" },
        )
        .select("id")
        .single();
      if (customer) customerId = customer.id;
    }

    const { data: order } = await supabase
      .from("store_orders")
      .insert({
        user_id: user?.id || null,
        status: "confirmed",
        subtotal: subtotal / 100,
        shipping: 0,
        total: subtotal / 100,
        payment_method: payMethod,
        kar_paid: payMethod === "kar" ? subtotal / 100 : 0,
        kar_reward: karReward,
        shipping_address: shipping,
        items: items.map((i) => ({
          name: i.name,
          qty: i.quantity,
          price: i.price,
          spice: i.spice_level,
        })),
      })
      .select("id")
      .single();

    if (order) {
      setOrderId(order.id);
      // Also create in ecom_orders for tracking
      await supabase.from("ecom_orders").insert({
        status: "paid",
        subtotal,
        tax: 0,
        shipping: 0,
        total: subtotal,
        shipping_address: shipping,
        stripe_payment_intent_id: paymentIntentId || null,
      });
    }

    // Award KAR reward
    if (user) {
      await supabase
        .from("profiles")
        .update({
          kar_balance: (user.kar_balance || 0) + karReward,
          total_earned: (user.total_earned || 0) + karReward,
        })
        .eq("id", user.id);
      updateBalance(karReward);

      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        tx_type: "trade_reward",
        amount: karReward,
        description: `Store purchase reward - Order ${order?.id?.slice(0, 8)}`,
      });

      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Order Confirmed!",
        message: `Your order has been confirmed. You earned ${karReward.toFixed(2)} KAR!`,
        notification_type: "order",
      });
    }

    // Send confirmation email
    if (order) {
      await supabase.functions
        .invoke("send-order-confirmation", {
          body: {
            orderId: order.id,
            customerEmail: shipping.email,
            customerName: shipping.name,
            orderItems: items.map((i) => ({
              product_name: i.name,
              variant_title: i.spice_level,
              quantity: i.quantity,
              unit_price: i.price,
              total: i.price * i.quantity,
            })),
            subtotal,
            shipping: 0,
            tax: 0,
            total: subtotal,
            shippingAddress: shipping,
          },
        })
        .catch(() => {});
    }

    clearCart();
    setOrderComplete(true);
  };

  const handlePaymentSuccess = async (paymentIntent: PaymentIntent) => {
    await createOrder(paymentIntent.id);
  };

  const handleKarPayment = async () => {
    if (!user) return;
    const totalKar = subtotal / 100;
    if (user.kar_balance < totalKar) {
      setPaymentError("Insufficient KAR balance");
      return;
    }
    await supabase
      .from("profiles")
      .update({ kar_balance: user.kar_balance - totalKar })
      .eq("id", user.id);
    updateBalance(-totalKar);
    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      tx_type: "purchase",
      amount: -totalKar,
      description: "Store purchase",
    });
    await createOrder();
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#0f1219] flex items-center justify-center p-4">
        <div className="bg-[#1a1f2e] rounded-2xl border border-emerald-500/30 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-400 mb-4">
            Order #{orderId.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            We'll start preparing your food right away. Check your email for
            details.
          </p>
          <div className="flex gap-3">
            <Link
              to="/orders"
              className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 font-medium rounded-xl hover:bg-emerald-500/30 transition-colors"
            >
              View Orders
            </Link>
            <Link
              to="/store"
              className="flex-1 py-3 bg-white/5 text-white font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1219] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Checkout</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {["Shipping", "Payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  (i === 0 && step === "shipping") ||
                  (i === 1 && step === "payment")
                    ? "bg-emerald-500 text-white"
                    : i === 0 && step === "payment"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/5 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${step === (i === 0 ? "shipping" : "payment") ? "text-white" : "text-gray-500"}`}
              >
                {s}
              </span>
              {i === 0 && <div className="w-12 h-px bg-gray-700" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === "shipping" ? (
              <form
                onSubmit={handleShippingSubmit}
                className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  Shipping Address
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Full Name", span: 2 },
                    { key: "email", label: "Email", span: 2, type: "email" },
                    { key: "address", label: "Address", span: 2 },
                    { key: "city", label: "City", span: 1 },
                    { key: "state", label: "State", span: 1 },
                    { key: "zip", label: "ZIP Code", span: 1 },
                    { key: "country", label: "Country", span: 1 },
                  ].map((f) => (
                    <div
                      key={f.key}
                      className={f.span === 2 ? "col-span-2" : ""}
                    >
                      <label className="text-xs text-gray-500 mb-1 block">
                        {f.label}
                      </label>
                      <input
                        required
                        value={shipping[f.key] || ""}
                        type={f.type || "text"}
                        onChange={(e) =>
                          setShipping({ ...shipping, [f.key]: e.target.value })
                        }
                        className="w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>

                {/* Payment Method Selection */}
                <div className="mt-6">
                  <label className="text-sm font-medium text-white mb-3 block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayMethod("card")}
                      className={`p-4 rounded-xl border text-left transition-all ${payMethod === "card" ? "border-emerald-500/50 bg-emerald-500/10" : "border-gray-700 bg-white/5 hover:border-gray-600"}`}
                    >
                      <CreditCard
                        className={`w-5 h-5 mb-2 ${payMethod === "card" ? "text-emerald-400" : "text-gray-400"}`}
                      />
                      <p
                        className={`text-sm font-medium ${payMethod === "card" ? "text-white" : "text-gray-300"}`}
                      >
                        Credit Card
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Visa, Mastercard, etc.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => isAuthenticated && setPayMethod("kar")}
                      disabled={!isAuthenticated}
                      className={`p-4 rounded-xl border text-left transition-all ${payMethod === "kar" ? "border-orange-500/50 bg-orange-500/10" : "border-gray-700 bg-white/5 hover:border-gray-600"} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Coins
                        className={`w-5 h-5 mb-2 ${payMethod === "kar" ? "text-orange-400" : "text-gray-400"}`}
                      />
                      <p
                        className={`text-sm font-medium ${payMethod === "kar" ? "text-white" : "text-gray-300"}`}
                      >
                        Pay with KAR
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {isAuthenticated
                          ? `Balance: ${user?.kar_balance?.toFixed(2)} KAR`
                          : "Sign in required"}
                      </p>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all"
                >
                  Continue to Payment
                </button>
              </form>
            ) : (
              <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Payment
                </h3>
                {payMethod === "kar" ? (
                  <div>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-4">
                      <p className="text-orange-400 font-medium">
                        Pay with KAR
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Total: {(subtotal / 100).toFixed(2)} KAR from your
                        wallet
                      </p>
                      <p className="text-sm text-gray-500">
                        Balance after:{" "}
                        {((user?.kar_balance || 0) - subtotal / 100).toFixed(2)}{" "}
                        KAR
                      </p>
                    </div>
                    {paymentError && (
                      <p className="text-red-400 text-sm mb-3">
                        {paymentError}
                      </p>
                    )}
                    <button
                      onClick={handleKarPayment}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
                    >
                      Confirm KAR Payment
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-yellow-400">
                      Card payment processing is being set up. Please pay with
                      KAR or check back soon.
                    </p>
                    <button
                      onClick={() => {
                        setPayMethod("kar");
                      }}
                      className="mt-3 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm hover:bg-orange-500/30 transition-colors"
                    >
                      Switch to KAR Payment
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setStep("shipping")}
                  className="w-full mt-3 py-2 text-gray-400 text-sm hover:text-white"
                >
                  Back to Shipping
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6 h-fit sticky top-20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Order Summary
            </h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 py-2 border-b border-gray-800/50"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.name}</p>
                    {item.spice_level && (
                      <p className="text-[10px] text-orange-400 flex items-center gap-0.5">
                        <Flame className="w-2 h-2" />
                        {item.spice_level}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="text-sm text-white">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">
                  ${(subtotal / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Shipping</span>
                <span className="text-emerald-400">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">KAR Reward</span>
                <span className="text-orange-400">
                  +{((subtotal * 0.02) / 100).toFixed(2)} KAR
                </span>
              </div>
              <div className="border-t border-gray-800 pt-2 flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-emerald-400 font-bold text-lg">
                  ${(subtotal / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
