import React from 'react';
import { GraduationCap, ShieldCheck, Heart, Sparkles, RefreshCcw, Users } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-slate-800">
          
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-600 rounded-2xl text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-wide">CampusConnect</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The premium peer-to-peer marketplace & community ecosystem for college students. Buy, sell, connect, and collaborate securely.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-800/40 w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified College Students</span>
            </div>
          </div>

          {/* Highlights / stats */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Ecosystem Stats</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg"><RefreshCcw className="w-4 h-4" /></div>
                <span>₹2.4M+ Student Savings</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg"><Users className="w-4 h-4" /></div>
                <span>15,000+ Active Students</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg"><Sparkles className="w-4 h-4" /></div>
                <span>4,200+ Books & Notes Reused</span>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Marketplace</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Engineering Calculators</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Textbooks & Study Guides</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Hostel Appliances & Gadgets</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Lab Equipment & Drafters</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Verified Senior Notes</a></li>
            </ul>
          </div>

          {/* Trust & Safety notice */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Trust & Safety</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every listing is linked to a verified university student ID. We encourage meeting inside campus premises (like central library or cafeteria) during daylight for exchanges.
            </p>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 flex items-center space-x-3 text-xs text-slate-300">
              <span className="text-xl">🎓</span>
              <span>Built by students, for students. Zero commission fees forever.</span>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© 2026 CampusConnect Inc. Proudly supporting sustainable student economies.</p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Campus Use</a>
            <a href="#" className="hover:text-slate-400">Security Hotline</a>
            <span className="flex items-center text-red-500 font-medium">Made with <Heart className="w-3.5 h-3.5 mx-1 fill-red-500" /> on Campus</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
