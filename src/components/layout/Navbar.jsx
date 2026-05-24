import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  GraduationCap, Search, ShoppingBag, MessageSquareText, 
  Heart, Bell, ShieldCheck, Sun, Moon, Plus, Sparkles, Menu, X, LogIn, UserPlus, LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { 
    user, isDarkMode, toggleTheme, 
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    wishlist, notifications,
    setIsWishlistOpen, setIsChatOpen, 
    setIsSellModalOpen, setIsVerifyModalOpen,
    setIsNotificationsOpen
  } = useApp();

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const unreadNotifs = notifications.filter(n => n.unread).length;

  const categories = ["All", "Notes", "Calculators", "Engineering tools", "Lab equipment", "Books", "Electronics", "Hostel essentials", "Study materials"];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 glass-nav shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabClick('marketplace')}>
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white transform hover:rotate-6 transition-transform duration-200">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                CampusConnect
              </span>
              <div className="hidden sm:flex items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">
                <span>College Thrift & Community</span>
                <span className="mx-1.5">•</span>
                <span className="text-emerald-500 font-bold flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                  Verified Ecosystem
                </span>
              </div>
            </div>
          </div>

          {/* Search bar - Hidden on mobile */}
          {location.pathname === '/' && activeTab === 'marketplace' && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, calculators, lab gear, books..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Action Icons & Nav Links */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Primary navigation tabs */}
            <nav className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-x-1 mr-2">
              <button
                onClick={() => handleTabClick('marketplace')}
                className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/' && activeTab === 'marketplace'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                Marketplace
              </button>
              <button
                onClick={() => handleTabClick('community')}
                className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/' && activeTab === 'community'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                <MessageSquareText className="w-4 h-4 mr-1.5" />
                Community
              </button>
              <button
                onClick={() => handleTabClick('smart-match')}
                className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/' && activeTab === 'smart-match'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                AI Smart Match
              </button>
              <Link
                to="/chat"
                className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  location.pathname === '/chat'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                <MessageSquareText className="w-4 h-4 mr-1.5" />
                Community Chat
              </Link>
              {currentUser && (
                <Link
                  to="/buyer-dashboard"
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    location.pathname === '/buyer-dashboard'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  Buying Dashboard
                </Link>
              )}
              {currentUser && (
                <Link
                  to="/seller-dashboard"
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    location.pathname === '/seller-dashboard'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  Selling Dashboard
                </Link>
              )}
              {currentUser && currentUser.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                    location.pathname === '/admin'
                      ? 'bg-red-550 text-white shadow-sm shadow-red-500/20'
                      : 'text-red-650 dark:text-red-450 hover:bg-red-50 dark:hover:bg-red-950/20'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Admin Control
                </Link>
              )}
            </nav>

            {/* Sell Button */}
            <button
              onClick={() => setIsSellModalOpen(true)}
              className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 hover:from-indigo-700 to-purple-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/40 text-xs sm:text-sm transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
              Sell Item
            </button>

            {/* Quick action buttons */}
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              
              {/* Wishlist */}
              <button 
                onClick={() => setIsWishlistOpen(true)}
                className="p-2 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Chat icon */}
              <button 
                onClick={() => setIsChatOpen(true)}
                className="p-2 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors"
                title="Real-time Chat"
              >
                <MessageSquareText className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
              </button>

              {/* Notifications */}
              <button 
                onClick={() => setIsNotificationsOpen(true)}
                className="p-2 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {/* Theme toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Switch mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
              </button>

              {/* User Authentication Status Section */}
              <div className="flex items-center pl-2 border-l border-slate-200 dark:border-slate-700">
                {currentUser ? (
                  <div className="flex items-center space-x-2">
                    <div 
                      onClick={() => setIsVerifyModalOpen(true)}
                      className="relative cursor-pointer"
                      title="Click to check verification status"
                    >
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name} 
                        className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl object-cover ring-2 ring-indigo-500/50 shadow-sm"
                      />
                      {currentUser.isVerified ? (
                        <div className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-white rounded-full ring-2 ring-white dark:ring-slate-900" title="Verified Student">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" title="Verification Pending"></div>
                      )}
                    </div>

                    <div className="hidden xl:block text-left text-xs mr-2">
                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[100px]">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center">
                        {currentUser.isVerified ? <span className="text-emerald-500 font-semibold">Verified ID</span> : <span className="text-amber-500 font-semibold">Verify Now</span>}
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Link
                      to="/login"
                      className="flex items-center px-3 py-2 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 transition-all"
                    >
                      <LogIn className="w-4 h-4 mr-1 sm:mr-1.5" /> Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all"
                    >
                      <UserPlus className="w-4 h-4 mr-1 sm:mr-1.5" /> Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile menu trigger */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl ml-1"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar - Shown in marketplace view */}
      {location.pathname === '/' && activeTab === 'marketplace' && (
        <div className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/90 py-2.5 overflow-x-auto no-scrollbar shadow-inner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 whitespace-nowrap">Categories:</span>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scroll-smooth">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5 shadow-xl space-y-4 animate-slide-up">
          {location.pathname === '/' && activeTab === 'marketplace' && (
            <div className="relative">
              <Search className="absolute inset-y-0 left-0 pl-3 top-3 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => { handleTabClick('marketplace'); setIsMobileMenuOpen(false); }}
              className={`flex items-center py-2.5 px-4 rounded-xl text-sm font-semibold ${location.pathname === '/' && activeTab === 'marketplace' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <ShoppingBag className="w-5 h-5 mr-3" /> Marketplace
            </button>
            <button
              onClick={() => { handleTabClick('community'); setIsMobileMenuOpen(false); }}
              className={`flex items-center py-2.5 px-4 rounded-xl text-sm font-semibold ${location.pathname === '/' && activeTab === 'community' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <MessageSquareText className="w-5 h-5 mr-3" /> Community Forums
            </button>
            <button
              onClick={() => { handleTabClick('smart-match'); setIsMobileMenuOpen(false); }}
              className={`flex items-center py-2.5 px-4 rounded-xl text-sm font-semibold ${location.pathname === '/' && activeTab === 'smart-match' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <Sparkles className="w-5 h-5 mr-3 text-amber-500" /> AI Smart Match
            </button>
            <Link
              to="/chat"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center py-2.5 px-4 rounded-xl text-sm font-semibold ${location.pathname === '/chat' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <MessageSquareText className="w-5 h-5 mr-3" /> Community Chat
            </Link>
            {currentUser && (
              <Link
                to="/buyer-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center py-2.5 px-4 rounded-xl text-sm font-semibold ${location.pathname === '/buyer-dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}
              >
                <ShoppingBag className="w-5 h-5 mr-3" /> Buying Dashboard
              </Link>
            )}
            {currentUser && (
              <Link
                to="/seller-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center py-2.5 px-4 rounded-xl text-sm font-semibold ${location.pathname === '/seller-dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}
              >
                <ShoppingBag className="w-5 h-5 mr-3" /> Selling Dashboard
              </Link>
            )}
            {currentUser && currentUser.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center py-2.5 px-4 rounded-xl text-sm font-semibold ${location.pathname === '/admin' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'text-red-650 dark:text-red-450'}`}
              >
                <ShieldCheck className="w-5 h-5 mr-3" /> Admin Control
              </Link>
            )}
          </div>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {currentUser ? (
              <>
                <div className="flex items-center space-x-3">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.branch} • {currentUser.year}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="p-2 text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl flex items-center text-xs font-bold"
                >
                  <LogOut className="w-4 h-4 mr-1" /> Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3 w-full">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-xs font-bold bg-indigo-600 text-white rounded-xl shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
