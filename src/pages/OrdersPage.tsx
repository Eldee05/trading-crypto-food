import { useState, useEffect } from "react";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  History,
  Package,
  RefreshCw,
  ShoppingCart,
  Check,
  Clock,
  ChefHat,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";

interface OrderItem {
  name: string;
  price: number;
  qty: number;
  spice?: string;
}

interface ShippingAddress {
  address?: string;
  city?: string;
  country?: string;
}

interface Order {
  id: string;
  status: string;
  subtotal: number;
  total: number;
  payment_method: string;
  kar_paid: number;
  kar_reward: number;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  created_at: string;
}

const STATUS_STEPS = ["pending", "confirmed", "preparing", "delivered"];
const STATUS_ICONS: Record<string, LucideIcon> = {
  pending: Clock,
  confirmed: Check,
  preparing: ChefHat,
  delivered: Truck,
};

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      console.log("fetching orders");
    };
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("store_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  const handleReorder = (order: Order) => {
    if (!order.items) return;
    order.items.forEach((item: OrderItem) => {
      addToCart(
        {
          id:
            item.name.toLowerCase().replace(/\s/g, "-") +
            "-" +
            (item.spice || "medium"),
          name: item.name,
          price: item.price,
          image:
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
          spice_level: item.spice,
        },
        item.qty,
      );
    });
    toast.success("Items added to cart!");
    navigate("/cart");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f1219] flex items-center justify-center">
        <div className="text-center">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Sign in to view orders
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

  return (
    <div className="min-h-screen bg-[#0f1219] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" /> Order History
          </h1>
          <button
            onClick={fetchOrders}
            className="p-2 text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
            <p className="text-gray-400 mb-6">
              Browse our store and place your first order!
            </p>
            <Link
              to="/store"
              className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl"
            >
              Browse Store
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const currentStep = STATUS_STEPS.indexOf(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">
                        ${Number(order.total).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.payment_method === "kar"
                          ? "Paid with KAR"
                          : "Credit Card"}
                      </p>
                    </div>
                  </div>

                  {/* Progress Tracker */}
                  <div className="px-4 py-3 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      {STATUS_STEPS.map((s, i) => {
                        const Icon = STATUS_ICONS[s];
                        const isActive = i <= currentStep;
                        const isCurrent = i === currentStep;
                        return (
                          <React.Fragment key={s}>
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCurrent
                                    ? "bg-emerald-500 text-white"
                                    : isActive
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-white/5 text-gray-600"
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <p
                                className={`text-[10px] mt-1 capitalize ${isActive ? "text-emerald-400" : "text-gray-600"}`}
                              >
                                {s}
                              </p>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div
                                className={`flex-1 h-0.5 mx-2 ${i < currentStep ? "bg-emerald-500" : "bg-gray-700"}`}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-4">
                    <div className="space-y-2 mb-3">
                      {(order.items || []).map((item: OrderItem, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-300">
                            {item.name} x{item.qty}{" "}
                            {item.spice && (
                              <span className="text-orange-400 text-xs">
                                ({item.spice})
                              </span>
                            )}
                          </span>
                          <span className="text-white">
                            $
                            {((Number(item.price) * item.qty) / 100).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                      {Number(order.kar_reward) > 0 && (
                        <span className="text-xs text-orange-400">
                          +{Number(order.kar_reward).toFixed(2)} KAR earned
                        </span>
                      )}
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-4 py-2 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-500/20 flex items-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" /> Reorder
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
