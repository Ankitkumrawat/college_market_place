import React, { useState } from 'react';
import { X, MessageSquareText, ShieldCheck, Heart, AlertTriangle, CheckCircle2, Clock, Tag, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ProductModal() {
  const { selectedProductModal, setSelectedProductModal, startChatWithSeller, wishlist, toggleWishlist, reportItem } = useApp();
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  if (!selectedProductModal) return null;
  const product = selectedProductModal;
  const isWishlisted = wishlist.includes(product.id);

  const handleReport = (e) => {
    e.preventDefault();
    if (!reportReason) return;
    reportItem(product.id, reportReason);
    setIsReporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row relative max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={() => setSelectedProductModal(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/50 hover:bg-slate-900 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Image Section */}
        <div className="md:w-1/2 relative bg-slate-100 dark:bg-slate-950 min-h-[300px] md:min-h-full flex items-center justify-center overflow-hidden">
          <img src={product.image} alt={product.title} className="w-full h-full object-cover max-h-[500px] md:max-h-full" />
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-xl">
              {product.condition}
            </span>
            <span className="px-3 py-1 bg-indigo-600/80 backdrop-blur-md text-white text-xs font-bold rounded-xl">
              {product.category}
            </span>
          </div>
        </div>

        {/* Right Details Section */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" /> Listed {product.createdAt}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors ${isWishlisted ? 'text-pink-600 border-pink-200 bg-pink-50 dark:bg-pink-950/30 dark:border-pink-900' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-pink-600' : ''}`} />
                </button>
                <button
                  onClick={() => setIsReporting(!isReporting)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Report Listing"
                >
                  <AlertTriangle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">{product.title}</h2>

            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base font-medium text-slate-400 line-through">₹{product.originalPrice}</span>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-b border-slate-100 dark:border-slate-800 py-4">
              {product.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map(t => (
                <span key={t} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-lg flex items-center font-medium">
                  <Tag className="w-3 h-3 mr-1 text-slate-400" /> {t}
                </span>
              ))}
            </div>

            {/* Seller profile box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={product.seller.avatar} alt={product.seller.name} className="w-12 h-12 rounded-2xl object-cover shadow" />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center text-sm sm:text-base">
                      {product.seller.name}
                      {product.seller.isVerified && <ShieldCheck className="w-4 h-4 ml-1.5 text-emerald-500" title="Verified Student" />}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{product.seller.branch} • {product.seller.year}</p>
                  </div>
                </div>
                {product.seller.rating && (
                  <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center">
                    ★ {product.seller.rating} Rating
                  </span>
                )}
              </div>
            </div>

            {/* Safety Reminder */}
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 flex items-start space-x-3 text-xs text-indigo-900 dark:text-indigo-200">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Campus Security Notice:</span> Meet inside college premises (Library or Student Center) to inspect the item before transferring money.
              </div>
            </div>

            {/* Reporting Form */}
            {isReporting && (
              <form onSubmit={handleReport} className="p-4 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900 space-y-3 animate-slide-up">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" /> Why are you reporting this listing?
                </span>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="e.g. Fake listing, incorrect pricing, non-student seller..."
                  className="w-full p-2.5 bg-white dark:bg-slate-800 text-xs rounded-xl border border-red-200 dark:border-red-800 focus:outline-none"
                  rows="2"
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setIsReporting(false)} className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400 hover:underline">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold shadow hover:bg-red-700">Submit Report</button>
                </div>
              </form>
            )}

          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => startChatWithSeller(product)}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-extrabold text-base flex items-center justify-center shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <MessageSquareText className="w-5 h-5 mr-2" /> Start Chat With {product.seller.name.split(' ')[0]}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
