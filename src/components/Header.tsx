import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Bell, User, Menu, X, LogOut, ChevronDown, Carrot, Wallet, History, Home, BarChart3, Store, Trash2, Check } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/trade', label: 'Trade', icon: BarChart3 },
    { path: '/store', label: 'Store', icon: Store },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/orders', label: 'Orders', icon: History },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#1a1f2e]/95 backdrop-blur-lg border-b border-emerald-900/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-orange-400 rounded-lg flex items-center justify-center">
            <Carrot className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-orange-400 bg-clip-text text-transparent">
            Karrotify
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.path} to={l.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive(l.path) ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Notifications */}
          {isAuthenticated && (
            <div className="relative">
              <button onClick={() => { setShowNotifs(!showNotifs); setShowUserMenu(false); }}
                className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#1e2538] rounded-xl border border-gray-700 shadow-2xl max-h-96 overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-gray-700">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-72">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-gray-500 text-sm text-center">No notifications yet</p>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b border-gray-700/50 ${!n.is_read ? 'bg-emerald-500/5' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${!n.is_read ? 'text-emerald-400' : 'text-gray-300'}`}>{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-gray-600 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!n.is_read && (
                              <button onClick={() => markAsRead(n.id)} className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded" title="Mark read">
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button onClick={() => deleteNotif(n.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded" title="Delete">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifs(false); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                  {user?.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1e2538] rounded-xl border border-gray-700 shadow-2xl py-2">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user?.display_name}</p>
                    <p className="text-xs text-gray-500">@{user?.username}</p>
                  </div>
                  <Link to="/profile" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/wallet" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5">
                    <Wallet className="w-4 h-4" /> Wallet
                  </Link>
                  <Link to="/orders" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5">
                    <History className="w-4 h-4" /> Order History
                  </Link>
                  <button onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all">
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-gray-400 hover:text-white">
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenu && (
        <div className="md:hidden bg-[#1a1f2e] border-t border-gray-800 py-2">
          {navLinks.map(l => (
            <Link key={l.path} to={l.path} onClick={() => setMobileMenu(false)}
              className={`flex items-center gap-3 px-4 py-3 text-sm ${
                isActive(l.path) ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-400'
              }`}>
              <l.icon className="w-4 h-4" /> {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
