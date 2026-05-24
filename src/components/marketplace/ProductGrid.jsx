import React, { useMemo, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { SlidersHorizontal, PackageOpen, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const { 
    products, setProducts, searchQuery, selectedCategory, 
    priceFilter, setPriceFilter,
    conditionFilter, setConditionFilter
  } = useApp();

  // Fetch listed products on page load
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products`);
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products from backend:", error);
        // Error is handled gracefully; UI falls back to previously cached/mock listings in state
      }
    };
    fetchAllProducts();
  }, [setProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const title = product.title || "";
      const description = product.description || "";
      const tags = product.tags || [];
      
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price <= priceFilter;
      const matchesCondition = conditionFilter === 'All' || product.condition === conditionFilter;

      return matchesSearch && matchesCategory && matchesPrice && matchesCondition;
    });
  }, [products, searchQuery, selectedCategory, priceFilter, conditionFilter]);

  const conditions = ["All", "New", "Like New", "Good", "Fair"];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Banner & Filter Controls */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Zero Commission College Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Buy & Sell <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-300 bg-clip-text text-transparent">Academic Essentials</span> Within Campus
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-xl">
            Pass down your textbooks, calculators, and drafters to juniors. Save money, reduce waste, and build a stronger campus ecosystem.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-800 dark:text-slate-200 relative z-10">
          
          {/* Max Price Filter */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow">
            <div className="flex items-center justify-between text-xs font-bold mb-2 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <span className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Max Budget</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">₹{priceFilter}</span>
            </div>
            <input 
              type="range" 
              min="100" 
              max="5000" 
              step="100"
              value={priceFilter}
              onChange={(e) => setPriceFilter(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
              <span>₹100</span>
              <span>₹5,000+</span>
            </div>
          </div>

          {/* Condition Filter */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow">
            <div className="text-xs font-bold mb-2 text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Condition Filter
            </div>
            <div className="flex flex-wrap gap-1.5">
              {conditions.map(cond => (
                <button
                  key={cond}
                  onClick={() => setConditionFilter(cond)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    conditionFilter === cond 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Active Status / Stats */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow flex flex-col justify-center">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{filteredProducts.length}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Available Items</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Grid Status Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center">
          <span>{selectedCategory === 'All' ? 'Explore All Listings' : `${selectedCategory} Available`}</span>
          <span className="ml-3 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
            {filteredProducts.length}
          </span>
        </h2>
        { (selectedCategory !== 'All' || searchQuery || priceFilter < 5000 || conditionFilter !== 'All') && (
          <button 
            onClick={() => { setConditionFilter('All'); setPriceFilter(5000); }} 
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <PackageOpen className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">No items found matching your criteria</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Try broadening your search term, adjusting the budget range slider, or exploring different categories.
          </p>
          <button
            onClick={() => { setConditionFilter('All'); setPriceFilter(5000); }}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow hover:bg-indigo-700"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

    </div>
  );
}
