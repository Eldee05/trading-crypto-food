import { useState, useMemo } from "react";
import {
  storeProducts,
  CATEGORIES,
  SPICE_LEVELS,
  StoreProduct,
} from "@/lib/storeData";
import { useCart } from "@/contexts/CartContext";
import {
  Search,
  X,
  ShoppingCart,
  Star,
  Clock,
  MapPin,
  Flame,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function StorePage() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(
    null,
  );
  const [selectedSpice, setSelectedSpice] = useState("Medium");
  const [qty, setQty] = useState(1);

  const filtered = useMemo(() => {
    let items = [...storeProducts];
    if (category !== "All")
      items = items.filter((p) => p.category === category);
    if (search)
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()),
      );
    switch (sortBy) {
      case "price-low":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        items.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        items.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        items.sort((a, b) => b.reviews - a.reviews);
    }
    return items;
  }, [search, category, sortBy]);

  const handleAddToCart = (product: StoreProduct, spice: string) => {
    addToCart(
      {
        id: product.id + "-" + spice,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        spice_level: spice,
      },
      qty,
    );
    toast.success(`${product.name} (${spice}) added to cart!`);
    setQty(1);
  };

  const similarProducts = selectedProduct
    ? storeProducts
        .filter((p) => selectedProduct.similar.includes(p.id))
        .slice(0, 4)
    : [];

  return (
    <div className="min-h-screen bg-[#0f1219]">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-orange-900/20 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Food Store</h1>
          <p className="text-gray-400 mb-6">
            100+ authentic African dishes from across the continent
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1f2e] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1a1f2e] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                category === c
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-[#1a1f2e] text-gray-400 border border-gray-800 hover:border-gray-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <p className="text-sm text-gray-500">{filtered.length} dishes found</p>
      </div>

      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filtered.map((product, i) => {
            const isLarge = i % 7 === 0;
            return (
              <div key={product.id} className="break-inside-avoid">
                <div
                  onClick={() => {
                    setSelectedProduct(product);
                    setSelectedSpice(product.spiceLevels[0] || "Medium");
                    setQty(1);
                  }}
                  className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden hover:border-emerald-500/30 transition-all cursor-pointer group"
                >
                  <div
                    className={`relative overflow-hidden ${isLarge ? "h-64" : "h-44"}`}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {product.tags.includes("bestseller") && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                        BESTSELLER
                      </span>
                    )}
                    <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {product.name}
                        </p>
                        <p className="text-gray-300 text-[10px] flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {product.origin}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold text-sm">
                          ${(product.price / 100).toFixed(2)}
                        </p>
                        <p className="text-orange-400 text-[10px]">
                          {product.karPrice} KAR
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-gray-400 text-xs line-clamp-2 mb-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-white">
                          {product.rating}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          ({product.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-[10px]">
                        <Clock className="w-3 h-3" /> {product.prepTime}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-[#1a1f2e] rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f2e] via-transparent to-transparent" />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 -mt-8 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                    <MapPin className="w-3 h-3" /> {selectedProduct.origin}
                    <span className="mx-1">|</span>
                    <Clock className="w-3 h-3" /> {selectedProduct.prepTime}
                    <span className="mx-1">|</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{" "}
                    {selectedProduct.rating} ({selectedProduct.reviews})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">
                    ${(selectedProduct.price / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-orange-400">
                    {selectedProduct.karPrice} KAR
                  </p>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-6">
                {selectedProduct.description}
              </p>

              {/* Spice Level */}
              <div className="mb-6">
                <label className="text-sm font-medium text-white mb-2 block items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" /> Spice Level
                </label>
                <div className="flex gap-2">
                  {selectedProduct.spiceLevels.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSpice(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSpice === s
                          ? s === "Fire"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : s === "Hot"
                              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                              : s === "Medium"
                                ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                : "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-white/5 text-gray-400 border border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="text-sm font-medium text-white mb-2 block">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-2 bg-white/5 border border-gray-700 rounded-lg text-white hover:bg-white/10"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-white font-bold text-lg w-8 text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="p-2 bg-white/5 border border-gray-700 rounded-lg text-white hover:bg-white/10"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct, selectedSpice);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Add to Cart - $
                  {((selectedProduct.price * qty) / 100).toFixed(2)}
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct, selectedSpice);
                    setSelectedProduct(null);
                    navigate("/cart");
                  }}
                  className="px-6 py-3 bg-orange-500/20 text-orange-400 font-semibold rounded-xl hover:bg-orange-500/30 transition-all"
                >
                  Buy Now
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedProduct.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 bg-white/5 text-gray-400 text-[10px] rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Similar Products */}
              {similarProducts.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    You might also like
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {similarProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setSelectedSpice(p.spiceLevels[0] || "Medium");
                          setQty(1);
                        }}
                        className="bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-20 object-cover"
                        />
                        <div className="p-2">
                          <p className="text-xs text-white font-medium truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-emerald-400">
                            ${(p.price / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
