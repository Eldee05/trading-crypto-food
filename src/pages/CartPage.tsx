import { useCart } from "@/contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Flame,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
    clearCart,
  } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1219] flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-6">
            Browse our store and add some delicious food!
          </p>
          <Link
            to="/store"
            className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Browse Store
          </Link>
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
          <h1 className="text-2xl font-bold text-white">
            Shopping Cart ({totalItems})
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-4 flex gap-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{item.name}</h3>
                      {item.spice_level && (
                        <span className="text-xs text-orange-400 flex items-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3" /> {item.spice_level}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 bg-white/5 border border-gray-700 rounded text-white hover:bg-white/10"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 bg-white/5 border border-gray-700 rounded text-white hover:bg-white/10"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-emerald-400 font-bold">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={clearCart}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Clear Cart
            </button>
          </div>

          <div className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6 h-fit sticky top-20">
            <h3 className="text-lg font-semibold text-white mb-4">
              Order Summary
            </h3>
            <div className="space-y-3 mb-4">
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
              <div className="border-t border-gray-800 pt-3 flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-emerald-400 font-bold text-lg">
                  ${(subtotal / 100).toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all"
            >
              Proceed to Checkout
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-3">
              Free shipping on all orders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
