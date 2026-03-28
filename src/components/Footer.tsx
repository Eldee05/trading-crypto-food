import React from 'react';
import { Link } from 'react-router-dom';
import { Carrot, Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f1219] border-t border-gray-800 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-orange-400 rounded-lg flex items-center justify-center">
                <Carrot className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Karrotify</span>
            </Link>
            <p className="text-sm text-gray-500 mb-4">The future of food trading. Swap, trade, and earn with agricultural commodities and perishable tokens.</p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"><MessageCircle className="w-4 h-4" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/trade" className="hover:text-emerald-400 transition-colors">Trading</Link></li>
              <li><Link to="/store" className="hover:text-emerald-400 transition-colors">Food Store</Link></li>
              <li><Link to="/wallet" className="hover:text-emerald-400 transition-colors">Wallet</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-400 transition-colors">Order History</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">Profile</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
              <li><Link to="/wallet" className="hover:text-emerald-400 transition-colors">Deposit / Withdraw</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">Referrals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/support" className="hover:text-emerald-400 transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Karrotify. All rights reserved. Built by DadaShef.</p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Trading
            </span>
            <span>60 Tokens</span>
            <span>100+ Foods</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
