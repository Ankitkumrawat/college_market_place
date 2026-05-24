import React from 'react';
import { Heart, MessageSquareText, ShieldCheck, Tag, Star, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, setSelectedProductModal, startChatWithSeller } = useApp();
  const isWishlisted = wishlist.includes(product.id);

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'Like New': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
      case 'New': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60';
      case 'Good': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';
      default: return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
    }
  };

  // Safe mapping between Camel Case (mockup) and Snake Case (backend SQL database schema)
  const originalPrice = product.original_price !== undefined ? product.original_price : product.originalPrice;
  const imageUrl = product.image_url || product.image;
  const isSellerVerified = product.seller 
    ? (product.seller.is_verified !== undefined ? product.seller.is_verified : product.seller.isVerified)
    : false;

  const savings = originalPrice ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative transform hover:-translate-y-1.5">
      
      {/* Product Image & Badges Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer" onClick={() => setSelectedProductModal(product)}>
        <img 
          src={imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-xs text-white line-clamp-2 font-medium">{product.description}</p>
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border shadow-sm backdrop-blur-md ${getConditionColor(product.condition)}`}>
            {product.condition}
          </span>
          {product.featured && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm flex items-center shadow-purple-500/20">
              <Sparkles className="w-3 h-3 mr-1" /> Senior Verified
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          className="absolute top-3 right-3 p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-lg text-slate-700 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 hover:scale-110 transition-all duration-200 z-10"
          title="Save to Wishlist"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-pink-600 text-pink-600' : ''}`} />
        </button>

        {/* Category Tag */}
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md text-white rounded-lg text-[10px] font-semibold tracking-wide uppercase">
          {product.category}
        </div>

        {/* Savings Badge */}
        {savings > 0 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow">
            Save {savings}%
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 
            onClick={() => setSelectedProductModal(product)} 
            className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1.5 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
          >
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline space-x-2 mb-4">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              ₹{product.price}
            </span>
            {originalPrice && originalPrice > product.price && (
              <span className="text-sm font-medium text-slate-400 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>

          {/* Seller Information */}
          {product.seller && (
            <div className="flex items-center justify-between py-3 px-3.5 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-100 dark:border-slate-700/60 mb-4">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="relative flex-shrink-0">
                  <img src={product.seller.avatar} alt={product.seller.name} className="w-8 h-8 rounded-xl object-cover" />
                  {isSellerVerified && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-white rounded-full ring-2 ring-white dark:ring-slate-800" title="Verified Student">
                      <ShieldCheck className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate flex items-center">
                    {product.seller.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {product.seller.branch} • {product.seller.year}
                  </p>
                </div>
              </div>
              {product.seller.rating && (
                <div className="flex items-center bg-white dark:bg-slate-800 px-2 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex-shrink-0">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                  <span className="text-xs font-bold">{product.seller.rating}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/80">
          <button 
            onClick={() => setSelectedProductModal(product)} 
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center transition-all duration-200"
          >
            View Details
          </button>
          <button 
            onClick={() => startChatWithSeller(product)} 
            className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-xs flex items-center justify-center shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200"
          >
            <MessageSquareText className="w-3.5 h-3.5 mr-1.5" /> Chat Seller
          </button>
        </div>

      </div>

    </div>
  );
}
