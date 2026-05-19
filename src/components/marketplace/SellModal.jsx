import React, { useState } from 'react';
import { X, Upload, Sparkles, Check, DollarSign, Tag, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SellModal() {
  const { isSellModalOpen, setIsSellModalOpen, addProduct } = useApp();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Notes');
  const [condition, setCondition] = useState('Like New');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(0);

  // Unsplash high quality presets for quick demo item creation
  const imagePresets = [
    { name: "Books / Notes", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80" },
    { name: "Electronics / Gadgets", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80" },
    { name: "Calculator / Tools", url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80" },
    { name: "Hostel Essentials", url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80" },
    { name: "Lab Equipment", url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80" }
  ];

  if (!isSellModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price) return;

    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const newProduct = {
      title,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category,
      condition,
      description: description || "No detailed description provided.",
      image: imagePresets[selectedPreset].url,
      tags: tagsArray.length > 0 ? tagsArray : [category, "College Essentials"]
    };

    addProduct(newProduct);
    setIsSellModalOpen(false);

    // Reset form
    setTitle('');
    setPrice('');
    setOriginalPrice('');
    setDescription('');
    setTagsInput('');
  };

  const categories = ["Notes", "Calculators", "Engineering tools", "Lab equipment", "Books", "Electronics", "Hostel essentials", "Study materials"];
  const conditions = ["New", "Like New", "Good", "Fair"];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        
        {/* Modal Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white relative">
          <button 
            onClick={() => setIsSellModalOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Student Thrift Exchange</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">List an Item For Sale</h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1">Turn your unused college supplies into cash. Zero commission fees forever.</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Image Selection Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Select Item Image Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {imagePresets.map((preset, idx) => (
                <div 
                  key={preset.name}
                  onClick={() => setSelectedPreset(idx)}
                  className={`relative rounded-xl overflow-hidden cursor-pointer h-20 border-2 transition-all ${
                    selectedPreset === idx ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-1 text-[10px] text-white font-semibold text-center truncate">
                    {preset.name}
                  </div>
                  {selectedPreset === idx && (
                    <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Item Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio fx-991EX Calculator / Physics Notes"
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Your Price (₹) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-600 dark:text-indigo-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Original Retail Price (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="e.g. 1200 (Optional)"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Item Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mention semester usage, missing pages, battery health, or pickup location in hostel/campus."
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              rows="3"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Tags (Comma separated)</label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Math, Engineering, 1stYear, Drafter"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Verification Assurance */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/60 flex items-center space-x-3 text-xs text-indigo-900 dark:text-indigo-200">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span>Listing will automatically display your Verified Student Badge to build trust among buyers.</span>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsSellModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200"
            >
              Publish Listing
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
