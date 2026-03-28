import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { storeProducts, CATEGORIES, StoreProduct } from '@/lib/storeData';
import Header from './Header';
import Footer from './Footer';
import { TrendingUp, TrendingDown, ArrowRight, Zap, Shield, Clock, Carrot, BarChart3, Store, Users, ChefHat, Flame, Search, Star, MapPin, ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface TokenPrice {
  symbol: string; name: string; token_type: string; current_price: number;
  price_change_24h: number; volume_24h: number; category: string; expires_at?: string;
}

const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [selectedSpice, setSelectedSpice] = useState('Medium');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrices = async () => {
    const { data } = await supabase.from('token_prices').select('*').eq('is_active', true).order('volume_24h', { ascending: false });
    if (data) setTokens(data);
    setLoading(false);
  };

  const topGainers = [...tokens].sort((a, b) => Number(b.price_change_24h) - Number(a.price_change_24h)).slice(0, 5);
  const topVolume = [...tokens].sort((a, b) => Number(b.volume_24h) - Number(a.volume_24h)).slice(0, 6);
  const shells = tokens.filter(t => t.token_type === 'perishable_shell').slice(0, 10);
  const featuredFood = storeProducts.filter(p => p.tags.includes('bestseller')).slice(0, 8);

  const handleAddToCart = (product: StoreProduct, spice: string) => {
    addToCart({ id: product.id + '-' + spice, name: product.name, price: product.price, image: product.image, category: product.category, spice_level: spice }, qty);
    toast.success(`${product.name} (${spice}) added to cart!`);
    setQty(1);
  };

  const similarProducts = selectedProduct ? storeProducts.filter(p => selectedProduct.similar.includes(p.id)).slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-[#0f1219] flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-[#0f1219] to-orange-900/20" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16,185,129,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251,146,60,0.1) 0%, transparent 50%)' }} />
          <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
                  <Flame className="w-3 h-3" /> Live Trading Now
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                  Trade Food Like<span className="bg-gradient-to-r from-emerald-400 to-orange-400 bg-clip-text text-transparent"> Crypto</span>
                </h1>
                <p className="text-lg text-gray-400 mb-8 max-w-lg">
                  Swap Jollof for Fried Rice, trade commodity coins, earn KAR rewards. The world's first food-backed trading platform with 60 tokens and 24hr perishable shells.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => navigate('/trade')} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2">
                    Start Trading <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate('/store')} className="px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                    Browse Store
                  </button>
                </div>
                <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-emerald-400" /> Secure</span>
                  <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-orange-400" /> Instant Swaps</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-400" /> 24hr Shells</span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-[#1a1f2e] rounded-2xl border border-gray-800 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Live Market</h3>
                    <span className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live</span>
                  </div>
                  <div className="space-y-3">
                    {(loading ? Array(6).fill(null) : topVolume).map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                        {t ? (<>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${t.token_type === 'perishable_shell' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{t.symbol.slice(0, 2)}</div>
                            <div><p className="text-sm text-white font-medium">{t.symbol}</p><p className="text-[10px] text-gray-500">{t.name}</p></div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white font-mono">${Number(t.current_price).toFixed(2)}</p>
                            <p className={`text-[10px] flex items-center gap-0.5 justify-end ${Number(t.price_change_24h) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {Number(t.price_change_24h) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {Math.abs(Number(t.price_change_24h)).toFixed(2)}%
                            </p>
                          </div>
                        </>) : <div className="w-full h-8 bg-gray-800/50 rounded animate-pulse" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-4 -mt-4 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ label: 'Total Tokens', value: '60', icon: BarChart3 }, { label: 'Commodity Coins', value: '30', icon: Carrot }, { label: 'Perishable Shells', value: '30', icon: Clock }, { label: 'Store Items', value: '100+', icon: Store }].map((s, i) => (
              <div key={i} className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2"><s.icon className="w-4 h-4 text-emerald-400" /><span className="text-xs text-gray-500">{s.label}</span></div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Top Gainers */}
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> Top Gainers</h2>
            <Link to="/trade" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topGainers.map(t => (
              <Link to="/trade" key={t.symbol} className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-4 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${t.token_type === 'perishable_shell' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{t.symbol.slice(0, 3)}</div>
                  <div><p className="text-sm text-white font-semibold">{t.symbol}</p><p className="text-[10px] text-gray-500">{t.name}</p></div>
                </div>
                <p className="text-lg font-bold text-white font-mono">${Number(t.current_price).toFixed(2)}</p>
                <p className="text-sm text-emerald-400 font-medium">+{Math.abs(Number(t.price_change_24h)).toFixed(2)}%</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Perishable Shells */}
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Clock className="w-5 h-5 text-orange-400" /> Perishable Shells <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">24hr Expiry</span></h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {shells.map(t => {
              const expiresAt = t.expires_at ? new Date(t.expires_at).getTime() : Date.now() + 86400000;
              const remaining = Math.max(0, expiresAt - Date.now());
              const hours = Math.floor(remaining / 3600000);
              const mins = Math.floor((remaining % 3600000) / 60000);
              return (
                <Link to="/trade" key={t.symbol} className="bg-[#1a1f2e] rounded-xl border border-orange-500/20 p-4 hover:border-orange-500/40 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-mono rounded-bl-lg">{hours}h {mins}m</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">{t.symbol.slice(0, 2)}</div>
                    <div><p className="text-sm text-white font-semibold">{t.symbol}</p><p className="text-[10px] text-gray-500">{t.name}</p></div>
                  </div>
                  <p className="text-lg font-bold text-white font-mono">${Number(t.current_price).toFixed(2)}</p>
                  <p className={`text-xs ${Number(t.price_change_24h) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{Number(t.price_change_24h) >= 0 ? '+' : ''}{Number(t.price_change_24h).toFixed(2)}%</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Food */}
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Store className="w-5 h-5 text-emerald-400" /> Featured Dishes</h2>
            <Link to="/store" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">View All 100+ <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredFood.map(product => (
              <div key={product.id} onClick={() => { setSelectedProduct(product); setSelectedSpice(product.spiceLevels[0]); setQty(1); }}
                className="bg-[#1a1f2e] rounded-xl border border-gray-800 overflow-hidden hover:border-emerald-500/30 transition-all cursor-pointer group">
                <div className="relative h-40 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">BESTSELLER</span>
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                    <p className="text-white font-semibold text-sm">{product.name}</p>
                    <p className="text-emerald-400 font-bold text-sm">${(product.price / 100).toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /><span className="text-xs text-white">{product.rating}</span></div>
                    <span className="text-orange-400 text-[10px]">{product.karPrice} KAR</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Why Karrotify?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Real-Time Trading', desc: 'Trade 30 commodity coins and 30 perishable shells with live pricing powered by our dynamic engine.' },
              { icon: Clock, title: '24hr Perishable Shells', desc: 'Shells expire in 24 hours - trade them for real food or swap to KAR before time runs out!' },
              { icon: ChefHat, title: 'AI Shef Assistant', desc: "Get market insights from our AI Shef using kitchen terminology. Find what's cooking in the market!" },
              { icon: Store, title: '100+ African Foods', desc: 'Browse and order from our store with 100+ authentic African dishes from across the continent.' },
              { icon: Users, title: 'Earn & Refer', desc: 'Earn KAR for every trade. Refer friends and both get 25 KAR bonus instantly.' },
              { icon: Shield, title: 'Secure Platform', desc: 'Your funds and trades are secured with enterprise-grade infrastructure and real-time monitoring.' },
            ].map((f, i) => (
              <div key={i} className="bg-[#1a1f2e] rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all">
                <f.icon className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <div className="bg-gradient-to-r from-emerald-900/50 to-orange-900/30 rounded-2xl border border-emerald-500/20 p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Trading?</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Join thousands of food traders. Get 10 KAR welcome bonus when you sign up.</p>
            <button onClick={() => navigate(isAuthenticated ? '/trade' : '/login')} className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all text-lg">
              {isAuthenticated ? 'Go to Trading' : 'Create Free Account'}
            </button>
          </div>
        </section>
      </main>
      <Footer />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <div className="bg-[#1a1f2e] rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative h-56">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 -mt-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                  <p className="text-gray-400 text-sm flex items-center gap-2 mt-1"><MapPin className="w-3 h-3" /> {selectedProduct.origin} | <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {selectedProduct.rating}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">${(selectedProduct.price / 100).toFixed(2)}</p>
                  <p className="text-sm text-orange-400">{selectedProduct.karPrice} KAR</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-6">{selectedProduct.description}</p>
              <div className="mb-4">
                <label className="text-sm font-medium text-white mb-2 block flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400" /> Spice Level</label>
                <div className="flex gap-2">
                  {selectedProduct.spiceLevels.map(s => (
                    <button key={s} onClick={() => setSelectedSpice(s)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedSpice === s ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-gray-400 border border-gray-700'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="mb-4 flex items-center gap-3">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 bg-white/5 border border-gray-700 rounded-lg text-white"><Minus className="w-4 h-4" /></button>
                <span className="text-white font-bold text-lg w-8 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="p-2 bg-white/5 border border-gray-700 rounded-lg text-white"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={() => { handleAddToCart(selectedProduct, selectedSpice); setSelectedProduct(null); }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Add to Cart - ${((selectedProduct.price * qty) / 100).toFixed(2)}
              </button>
              {similarProducts.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-800">
                  <h3 className="text-sm font-semibold text-white mb-3">You might also like</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {similarProducts.map(p => (
                      <div key={p.id} onClick={() => { setSelectedProduct(p); setSelectedSpice(p.spiceLevels[0]); setQty(1); }} className="bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:bg-white/10">
                        <img src={p.image} alt={p.name} className="w-full h-16 object-cover" />
                        <div className="p-1.5"><p className="text-[10px] text-white truncate">{p.name}</p><p className="text-[10px] text-emerald-400">${(p.price / 100).toFixed(2)}</p></div>
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
};

export default AppLayout;
