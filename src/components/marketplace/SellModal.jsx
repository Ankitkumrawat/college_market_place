import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { X, Upload, Sparkles, Check, DollarSign, Tag, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SellModal() {
  const { isSellModalOpen, setIsSellModalOpen, addProduct, fetchProducts } = useApp();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Notes');
  const [condition, setCondition] = useState('Like New');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customFile, setCustomFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unsplash high quality presets for quick demo item creation
  const imagePresets = [
    { name: "Books / Notes", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80" },
    { name: "Electronics / Gadgets", url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80" },
    { name: "Calculator / Tools", url: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80" },
    { name: "Hostel Essentials", url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80" },
    { name: "Lab Equipment", url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80" }
  ];

  if (!isSellModalOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomFile(file);
      setImagePreview(URL.createObjectURL(file));
      setSelectedPreset(-1); // Deselect preset since we have custom file
    }
  };

  const handlePresetSelect = (idx) => {
    setSelectedPreset(idx);
    setCustomFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price) return;
    
    setIsSubmitting(true);
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please register or log in first to create product listings.");
        setIsSubmitting(false);
        return;
      }

      // Construct FormData for multipart upload matching backend router exactly
      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', Number(price));
      formData.append('original_price', originalPrice ? Number(originalPrice) : '');
      formData.append('description', description || '');
      formData.append('category', category);
      formData.append('condition', condition);
      formData.append('tags', JSON.stringify(tagsArray.length > 0 ? tagsArray : [category, "College Essentials"]));

      // Handle image payload mapping
      if (customFile) {
        formData.append('image', customFile); // Must match backend 'image' key exactly
      } else {
        formData.append('image_url', imagePresets[selectedPreset].url);
      }

      // Perform POST request to FastAPI endpoint with form-data
      const response = await axios.post(`${API_URL}/api/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Synchronize list in parent context
      if (fetchProducts) {
        await fetchProducts();
      } else if (addProduct) {
        // Fallback to update state locally using the response object from backend
        addProduct(response.data);
      }

      setIsSellModalOpen(false);

      // Reset form fields
      setTitle('');
      setPrice('');
      setOriginalPrice('');
      setDescription('');
      setTagsInput('');
      setCustomFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      setSelectedPreset(0);
    } catch (error) {
      console.error("Error uploading listing to backend:", error);
      alert(error.response?.data?.detail || "Could not publish your listing. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
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
          
          {/* Image Selection / Custom Upload */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Item Image *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Custom Upload Area */}
              <div className="relative">
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200 overflow-hidden group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {customFile ? (
                    <div className="w-full h-full relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Upload className="w-4 h-4" />
                        <span>Replace Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                        <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                        Upload custom image
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 block mt-1">
                        PNG, JPG up to 5MB
                      </span>
                    </div>
                  )}
                </label>
              </div>

              {/* Preset Gallery */}
              <div className="space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Or choose a preset template:
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {imagePresets.map((preset, idx) => (
                      <div
                        key={preset.name}
                        onClick={() => handlePresetSelect(idx)}
                        className={`relative rounded-xl overflow-hidden cursor-pointer h-14 border-2 transition-all duration-200 ${
                          selectedPreset === idx && !customFile
                            ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/30 opacity-100'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        {selectedPreset === idx && !customFile && (
                          <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                            <div className="bg-indigo-600 text-white rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Active Image Preview Indicator */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <img
                      src={customFile ? imagePreview : imagePresets[selectedPreset]?.url}
                      alt="Active listing preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Active Listing Image
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate block">
                      {customFile ? `Custom: ${customFile.name}` : `Preset: ${imagePresets[selectedPreset]?.name}`}
                    </span>
                  </div>
                </div>
              </div>
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Publishing...
                </>
              ) : "Publish Listing"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
