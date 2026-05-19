import React from 'react';
import { X, Heart, Trash2, ArrowRight, MessageSquareText, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function WishlistDrawer() {
  const { isWishlistOpen, setIsWishlistOpen, wishlist, toggleWishlist, products, setSelectedProductModal, startChatWithSeller } = useApp();

  if (!isWishlistOpen) return null;

  const savedItems = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-slide-up">
        
        {/* Drawer Header */}
        <div className="p-5 bg-gradient-to-r from-pink-600 to-purple-600 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">My Saved Items</h3>
              <p className="text-xs text-pink-100 font-medium">{savedItems.length} items bookmarked</p>
            </div>
          </div>
          <button 
            onClick={() => setIsWishlistOpen(false)}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-slate-950/60">
          {savedItems.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ShoppingBag className="w-16 h-16 mx-auto mb-3 opacity-40" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">Your wishlist is empty</p>
              <p className="text-xs mt-1 text-slate-500">Explore the marketplace and click the heart icon on any product to save it here.</p>
            </div>
          ) : (
            savedItems.map(item => (
              <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between space-x-3 group hover:shadow transition-shadow">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-16 h-16 rounded-xl object-cover cursor-pointer flex-shrink-0" 
                  onClick={() => { setSelectedProductModal(item); setIsWishlistOpen(false); }}
                />
                
                <div className="flex-1 min-w-0">
                  <h4 
                    onClick={() => { setSelectedProductModal(item); setIsWishlistOpen(false); }}
                    className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">₹{item.price}</p>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">Seller: {item.seller.name}</p>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <button
                    onClick={() => { startChatWithSeller(item); setIsWishlistOpen(false); }}
                    className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                    title="Chat with Seller"
                  >
                    <MessageSquareText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(item.id)}
                    className="p-2 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {savedItems.length > 0 && (
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-xs flex items-center justify-center shadow hover:opacity-90"
            >
              <span>Continue Shopping</span> <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
