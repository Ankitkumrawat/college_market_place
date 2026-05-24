import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldAlert, Trash2, UserX, AlertTriangle, Search, 
  MessageSquareText, ShoppingBag, ArrowLeft, ShieldCheck, 
  X, CheckCircle, Ban, AlertCircle, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

export default function AdminPanel() {
  const { currentUser } = useAuth();
  const { 
    products, setProducts, fetchProducts, 
    posts, setPosts, addNotification 
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('marketplace'); // 'marketplace' or 'community'
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmBan, setConfirmBan] = useState(null); // { id, name }
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Unauthorized access check
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in backdrop-blur-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto text-red-650 dark:text-red-400">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Access Denied</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This area is restricted to system administrators. Student accounts cannot view moderation controls.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
        </div>
      </div>
    );
  }

  // Refresh products from server
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchProducts();
      addNotification("Data Refreshed", "Latest marketplace listings synced from database.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId, title) => {
    if (typeof productId === 'string' && isNaN(Number(productId))) {
      // Mock product deletion (local state)
      setProducts(prev => prev.filter(p => p.id !== productId));
      addNotification("Listing Deleted (Mock)", `Mock listing "${title}" has been deleted locally.`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchProducts();
      addNotification("Listing Deleted", `Permanently removed product listing "${title}".`);
    } catch (error) {
      console.error("Failed to delete product:", error);
      addNotification("Delete Failed", error.response?.data?.detail || "Could not delete listing.");
    }
  };

  // Delete post
  const handleDeletePost = async (postId, title) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn("Post delete audit route skipped or failed:", err);
    }
    
    // Always filter out locally
    setPosts(prev => prev.filter(p => p.id !== postId));
    addNotification("Post Removed", `Permanently removed discussion "${title}".`);
  };

  // Ban user (suspend account & delete products)
  const handleBanUser = async () => {
    if (!confirmBan) return;
    const { id: userId, name: userName } = confirmBan;

    if (typeof userId === 'string' && isNaN(Number(userId))) {
      // Mock user suspension (local state)
      setProducts(prev => prev.filter(p => p.seller.id !== userId));
      setPosts(prev => prev.filter(p => p.author.id !== userId && p.author.name !== userName));
      addNotification("User Suspended (Mock)", `Mock user "${userName}" has been banned locally.`);
      setConfirmBan(null);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/admin/users/${userId}/ban`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh products from backend
      await fetchProducts();
      // Filter out posts from that user
      setPosts(prev => prev.filter(p => p.author.id !== userId));
      
      addNotification("User Suspended", `Student "${userName}" has been banned and their listings removed.`);
    } catch (error) {
      console.error("Failed to ban user:", error);
      addNotification("Ban Failed", error.response?.data?.detail || "Could not suspend user.");
    } finally {
      setConfirmBan(null);
    }
  };

  // Filter listings based on search
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const title = product.title || "";
      const sellerName = product.seller?.name || "";
      const sellerEmail = product.seller?.email || product.seller?.collegeEmail || "";
      const query = searchQuery.toLowerCase();
      return title.toLowerCase().includes(query) || 
             sellerName.toLowerCase().includes(query) ||
             sellerEmail.toLowerCase().includes(query);
    });
  }, [products, searchQuery]);

  // Filter posts based on search
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const title = post.title || "";
      const content = post.content || "";
      const authorName = post.author?.name || "";
      const query = searchQuery.toLowerCase();
      return title.toLowerCase().includes(query) || 
             content.toLowerCase().includes(query) ||
             authorName.toLowerCase().includes(query);
    });
  }, [posts, searchQuery]);

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Admin Panel Welcome Banner */}
      <div className="bg-gradient-to-r from-red-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-red-500/20">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-rose-300 text-xs font-semibold backdrop-blur-md">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Campus Moderation Console</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Administrative <span className="bg-gradient-to-r from-rose-200 via-rose-300 to-amber-300 bg-clip-text text-transparent">Control Center</span>
          </h1>
          <p className="text-slate-350 text-sm sm:text-base font-normal max-w-xl">
            Protect the college community. Monitor marketplace items, flag and delete illegal or spam listings, and suspend toxic user accounts.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Navigation & Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
          
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-x-1 self-start">
            <button
              onClick={() => { setActiveTab('marketplace'); setSearchQuery(''); }}
              className={`flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'marketplace'
                  ? 'bg-white dark:bg-slate-800 text-rose-650 dark:text-rose-450 shadow-sm'
                  : 'text-slate-600 dark:text-slate-450 hover:text-rose-600 dark:hover:text-rose-450'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Products ({products.length})
            </button>
            <button
              onClick={() => { setActiveTab('community'); setSearchQuery(''); }}
              className={`flex items-center px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === 'community'
                  ? 'bg-white dark:bg-slate-800 text-rose-650 dark:text-rose-450 shadow-sm'
                  : 'text-slate-600 dark:text-slate-450 hover:text-rose-600 dark:hover:text-rose-450'
              }`}
            >
              <MessageSquareText className="w-4 h-4 mr-2" />
              Discussions ({posts.length})
            </button>
          </div>

          {/* Search and Action Tools */}
          <div className="flex items-center gap-2 flex-1 md:max-w-md w-full justify-end">
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 w-4 h-4 top-[14px]" />
              <input
                type="text"
                placeholder={activeTab === 'marketplace' ? "Search by title, seller..." : "Search by title, content, author..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
              />
            </div>
            
            {activeTab === 'marketplace' && (
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 transition-colors flex items-center justify-center"
                title="Sync from Database"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

        </div>

        {/* Tab Contents */}
        {activeTab === 'marketplace' ? (
          /* Marketplace Listings Table/Grid */
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                No listings found matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/85 dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-4">Product Info</th>
                      <th className="px-6 py-4">Seller Details</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Moderator Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-800 font-medium">
                    {filteredProducts.map(prod => {
                      const seller = prod.seller || {};
                      const sellerEmail = seller.email || seller.collegeEmail || 'N/A';
                      const sellerId = seller.id;
                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3.5">
                              {(() => {
                                const rawImage = prod.image_url || prod.image;
                                const imageUrl = rawImage && (rawImage.startsWith('http') || rawImage.startsWith('data:') || rawImage.startsWith('blob:'))
                                  ? rawImage
                                  : (rawImage ? `${API_URL}/${rawImage}` : '');
                                return imageUrl ? (
                                  <img 
                                    src={imageUrl} 
                                    alt={prod.title} 
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-450 border border-slate-200 dark:border-slate-800 font-bold uppercase text-[10px]">
                                    No Img
                                  </div>
                                );
                              })()}
                              <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 truncate max-w-[200px]">{prod.title}</h3>
                                <p className="text-[10px] text-slate-450 uppercase tracking-wider">{prod.condition} Condition</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1">
                                <span>{seller.name || 'Anonymous'}</span>
                                {seller.role === 'admin' && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" title="System Admin" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-450">{sellerEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-black text-slate-800 dark:text-slate-100">
                            ₹{prod.price}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-650 dark:text-slate-350 text-[10px] font-extrabold tracking-wide uppercase">
                              {prod.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.title)}
                              className="px-3 py-1.5 border border-red-200 dark:border-red-900 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold text-xs transition-colors flex inline-flex items-center"
                              title="Delete listing"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmBan({ id: sellerId, name: seller.name })}
                              disabled={seller.role === 'admin'}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all inline-flex items-center ${
                                seller.role === 'admin' 
                                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                  : 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/10'
                              }`}
                              title={seller.role === 'admin' ? 'Cannot ban admins' : 'Suspend seller account'}
                            >
                              <UserX className="w-3.5 h-3.5 mr-1" />
                              Suspend
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Community Discussions Moderation */
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                No discussion threads found matching your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map(post => {
                  const author = post.author || {};
                  const authorName = author.name || 'Anonymous';
                  const authorEmail = author.collegeEmail || author.email || 'No email';
                  const authorId = author.id;

                  return (
                    <div key={post.id} className="bg-slate-50/70 dark:bg-slate-900/30 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 space-y-4 hover:border-rose-500/20 transition-all flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Post Meta */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2.5 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-750 dark:text-purple-305 font-bold rounded-lg border border-purple-200/40 dark:border-purple-800/40">
                            {post.category}
                          </span>
                          <span className="text-slate-450">{post.createdAt}</span>
                        </div>
                        {/* Post Title */}
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-snug line-clamp-1">{post.title}</h3>
                        {/* Post Snippet */}
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">{post.content}</p>
                        {/* Author info */}
                        <div className="pt-3 flex items-center space-x-2.5 border-t border-slate-200/60 dark:border-slate-800/60">
                          <img src={author.avatar} alt={authorName} className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1">
                              <span>{authorName}</span>
                              {author.isVerified && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                              {author.role === 'admin' && <ShieldCheck className="w-3 h-3 text-rose-500" title="Admin" />}
                            </p>
                            <p className="text-[10px] text-slate-450">{author.branch} • {author.year || authorEmail}</p>
                          </div>
                        </div>
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-end space-x-2 pt-2">
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="px-3 py-1.5 border border-red-200 dark:border-red-900 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold text-xs transition-colors flex inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Remove Post
                        </button>
                        <button
                          onClick={() => setConfirmBan({ id: authorId || 'guest', name: authorName })}
                          disabled={author.role === 'admin' || authorId === 'guest'}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all inline-flex items-center ${
                            author.role === 'admin' || authorId === 'guest'
                              ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/10'
                          }`}
                          title={author.role === 'admin' ? 'Cannot ban admins' : authorId === 'guest' ? 'Cannot ban guest users' : 'Suspend author'}
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" />
                          Suspend Author
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Confirmation Ban Modal Overlay */}
      {confirmBan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-sm w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-2xl space-y-6 transform scale-100 transition-all duration-200">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400 rounded-2xl">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <button 
                onClick={() => setConfirmBan(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Confirm Account Suspension</h2>
              <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                Are you sure you want to suspend <span className="font-extrabold text-slate-800 dark:text-slate-105">"{confirmBan.name}"</span>?
                This action is irreversible and will:
              </p>
              <ul className="list-disc pl-5 text-[11px] text-slate-500 dark:text-slate-450 space-y-1">
                <li>Ban the user from logging back into CampusConnect.</li>
                <li>Permanently delete all their active marketplace product listings from the database.</li>
              </ul>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setConfirmBan(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-750 text-white rounded-xl font-bold text-xs shadow-md shadow-red-500/20 transition-colors"
              >
                Confirm Suspend
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
