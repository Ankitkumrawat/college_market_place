import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProductGrid from './components/marketplace/ProductGrid';
import ProductModal from './components/marketplace/ProductModal';
import SellModal from './components/marketplace/SellModal';
import CommunityFeed from './components/community/CommunityFeed';
import AiAdvisor from './components/smart/AiAdvisor';
import ChatDrawer from './components/chat/ChatDrawer';
import WishlistDrawer from './components/wishlist/WishlistDrawer';
import NotificationDrawer from './components/notifications/NotificationDrawer';
import VerifyModal from './components/auth/VerifyModal';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

function CampusHome() {
  const { activeTab } = useApp();
  return (
    <div className="animate-fade-in">
      {activeTab === 'marketplace' && <ProductGrid />}
      {activeTab === 'community' && <CommunityFeed />}
      {activeTab === 'smart-match' && <AiAdvisor />}
    </div>
  );
}

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>
      <Footer />
      <ProductModal />
      <SellModal />
      <VerifyModal />
      <ChatDrawer />
      <WishlistDrawer />
      <NotificationDrawer />
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200 justify-center">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CampusHome />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
}
