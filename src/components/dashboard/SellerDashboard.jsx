import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Send, ShoppingBag, MessageSquareText, ShieldCheck, 
  ArrowLeft, Clock, Sparkles, User, Tag, Plus, CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

export default function SellerDashboard() {
  const { currentUser } = useAuth();
  const { addNotification, setIsSellModalOpen, markProductAsSold } = useApp();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [conversations, setConversations] = useState([]);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productBuyers, setProductBuyers] = useState([]);
  const [selectedBuyerConv, setSelectedBuyerConv] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Helper to resolve product image paths
  const getProductImageUrl = (prod) => {
    if (!prod) return '';
    const rawImage = prod.image_url || prod.image;
    return rawImage && (rawImage.startsWith('http') || rawImage.startsWith('data:') || rawImage.startsWith('blob:'))
      ? rawImage 
      : (rawImage ? `${API_URL}/${rawImage}` : '');
  };

  // Fetch Seller's Products & Conversations from Backend
  const fetchData = async () => {
    setIsLoadingProducts(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoadingProducts(false);
      return;
    }
    try {
      // 1. Fetch seller's own products
      const prodRes = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
// Filter products belonging to current user
      const myProducts = prodRes.data.filter(p => p.seller_id === currentUser?.id);
      setProducts(myProducts);

      // 🌟 FIXED: Python comment (#) hata kar proper JS comment (//) lagaya aur active seller data pull kiya
      const convRes = await axios.get(`${API_URL}/api/buyer/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(convRes.data);

      if (selectedProduct) {
        const updated = myProducts.find(p => p.id === selectedProduct.id);
        if (updated) setSelectedProduct(updated);
      }
    } catch (err) {
      console.error("Failed to load seller dashboard data:", err);
      addNotification("Error", "Could not load seller details.");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Update interested buyers list when selectedProduct or conversations change
  useEffect(() => {
    if (!selectedProduct) {
      setProductBuyers([]);
      setSelectedBuyerConv(null);
      return;
    }

    const filteredConvs = conversations.filter(c => c.product_id === selectedProduct.id);
    setProductBuyers(filteredConvs);

    if (filteredConvs.length > 0) {
      const stillExists = filteredConvs.find(c => c.id === selectedBuyerConv?.id);
      if (!stillExists) {
        setSelectedBuyerConv(filteredConvs[0]);
      } else {
        setSelectedBuyerConv(stillExists);
      }
    } else {
      setSelectedBuyerConv(null);
    }
  }, [selectedProduct, conversations]);

  // Fetch Message History
  const fetchMessages = async (convId) => {
    setIsLoadingMessages(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/chat/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load seller messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket Connection
  useEffect(() => {
    if (!selectedBuyerConv) {
      setMessages([]);
      return;
    }

    fetchMessages(selectedBuyerConv.id);

    const token = localStorage.getItem('token');
    if (!token) return;

    let ws = null;
    try {
      const wsHost = API_URL.replace(/^https?:\/\//, '');
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProto}//${wsHost}/api/chat/ws/conversation/${selectedBuyerConv.id}/${token}`;

      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.conversation_id === selectedBuyerConv.id) {
            setMessages(prev => {
              if (prev.some(m => m.id === data.id)) return prev;
              return [...prev, {
                id: data.id,
                conversation_id: data.conversation_id,
                sender_id: data.sender_id,
                text: data.text,
                created_at: data.created_at
              }];
            });
          }
        } catch (e) {
          console.error("Failed to parse incoming WS text:", e);
        }
      };

      ws.onclose = () => {
        console.log(`WebSocket closed for seller conversation: ${selectedBuyerConv.id}`);
      };

    } catch (err) {
      console.error("WebSocket initialization failed:", err);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [selectedBuyerConv?.id]);

  // Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText || !inputText.trim() || !selectedBuyerConv) return;
    const text = inputText.trim();
    setIsSending(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setIsSending(false);
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({ text }));
        setInputText('');
      } catch (err) {
        console.error("WS send failed, attempting REST API fallback:", err);
        await sendViaHttp(text, token);
      } finally {
        setIsSending(false);
      }
    } else {
      await sendViaHttp(text, token);
    }
  };

  const sendViaHttp = async (text, token) => {
    try {
      const res = await axios.post(`${API_URL}/api/chat/conversations/${selectedBuyerConv.id}/messages`, {
        text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => {
        if (prev.some(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });

      setInputText('');
    } catch (err) {
      console.error("REST fallback message send failed:", err);
      addNotification("Send Failed", "Could not send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsSold = async () => {
    if (!selectedProduct || !selectedBuyerConv) return;
    const res = await markProductAsSold(selectedProduct.id, selectedBuyerConv.buyer_id);
    if (res && res.success) {
      fetchData();
    }
  };

  const isUserVerified = (usr) => {
    if (!usr) return false;
    return usr.is_verified || usr.isVerified;
  };

  return (
    <div className="h-[75vh] flex rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
      
      {/* Left Items Sidebar */}
      <div className="w-1/3 sm:w-1/4 border-r border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-between">
        <div className="flex-1 flex flex-col min-h-0">
          
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center uppercase">
              <ShoppingBag className="w-4 h-4 mr-2 text-indigo-500" />
              My Listings
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoadingProducts ? (
              <div className="text-center py-10 text-xs text-slate-400 font-medium animate-pulse">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-10 px-2 text-slate-450 space-y-3">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-350 opacity-60" />
                <p className="font-bold text-xs">No listed items found</p>
                <p className="text-[10px] leading-relaxed">
                  Start uploading thrift products to find students who want to buy.
                </p>
                <button
                  onClick={() => setIsSellModalOpen(true)}
                  className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] flex items-center justify-center mx-auto"
                >
                  <Plus className="w-3.5 h-3.5 mr-1 stroke-[3]" /> Upload Item
                </button>
              </div>
            ) : (
              products.map(prod => {
                const isActive = selectedProduct?.id === prod.id;
                const prodImg = getProductImageUrl(prod);
                return (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedProduct(prod)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start space-x-3 ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 border border-slate-100 dark:border-slate-700">
                      <img src={prodImg} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`font-black text-xs truncate ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                          {prod.title}
                        </h4>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          prod.status === 'sold' || prod.is_sold
                            ? (isActive ? 'bg-indigo-700 text-white' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400')
                            : (isActive ? 'bg-indigo-500 text-white' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400')
                        }`}>
                          {prod.status === 'sold' || prod.is_sold ? 'Sold' : 'Active'}
                        </span>
                      </div>
                      <p className={`text-[10px] font-bold ${isActive ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        ₹{prod.price}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {currentUser && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 flex items-center space-x-2.5 overflow-hidden">
            <img src={currentUser.avatar} className="w-8 h-8 rounded-lg object-cover shadow-sm" alt="" />
            <div className="truncate text-left">
              <p className="text-xs font-black text-slate-850 dark:text-slate-100 truncate">{currentUser.name}</p>
              <p className="text-[9px] text-slate-550 dark:text-slate-400 uppercase tracking-wide truncate">{currentUser.branch}</p>
            </div>
          </div>
        )}
      </div>

      {/* Messages Workspace */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950/40 justify-between">
        {selectedProduct ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow-sm gap-3">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0">
                  <img src={getProductImageUrl(selectedProduct)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <h1 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 truncate">
                    {selectedProduct.title}
                  </h1>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">₹{selectedProduct.price}</span>
                    <span className="text-slate-350">•</span>
                    <span className={`text-[10px] font-bold uppercase ${selectedProduct.status === 'sold' || selectedProduct.is_sold ? 'text-red-500' : 'text-emerald-500'}`}>
                      {selectedProduct.status === 'sold' || selectedProduct.is_sold ? 'Sold' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mark As Sold Action */}
              {selectedProduct.status !== 'sold' && !selectedProduct.is_sold && selectedBuyerConv && (
                <button
                  onClick={handleMarkAsSold}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center transition-all flex-shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark as Sold
                </button>
              )}
            </div>

            {/* Buyers Row List */}
            {productBuyers.length > 1 && (
              <div className="bg-slate-100/50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/50 px-4 py-2 flex items-center space-x-2 overflow-x-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-2 whitespace-nowrap">Buyers:</span>
                {productBuyers.map(buyerConv => {
                  const isTabActive = selectedBuyerConv?.id === buyerConv.id;
                  return (
                    <button
                      key={buyerConv.id}
                      onClick={() => setSelectedBuyerConv(buyerConv)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        isTabActive
                          ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700/60'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {buyerConv.buyer.name}
                      {isUserVerified(buyerConv.buyer) && <ShieldCheck className="w-3 h-3 text-emerald-500 inline ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Chat Workspace text render */}
            {selectedBuyerConv ? (
              <div className="flex-1 flex flex-col justify-between min-h-0">
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {isLoadingMessages ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse">
                      Loading conversation messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                      <Sparkles className="w-8 h-8 text-amber-400 animate-bounce" />
                      <p className="text-xs sm:text-sm font-bold text-slate-750 dark:text-slate-350">
                        Chat started with {selectedBuyerConv.buyer.name.split(' ')[0]}!
                      </p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.sender_id === currentUser?.id;
                      const timeStr = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                      return (
                        <div key={msg.id} className={`flex items-start space-x-3.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <img 
                            src={isMe ? currentUser.avatar : selectedBuyerConv.buyer.avatar} 
                            alt="" 
                            className="w-8.5 h-8.5 rounded-xl object-cover shadow-sm flex-shrink-0" 
                          />
                          <div className="max-w-[70%] space-y-0.5">
                            <div className={`flex items-baseline space-x-2 text-[10px] ${isMe ? 'justify-end' : ''}`}>
                              <span className="font-extrabold text-slate-700 dark:text-slate-300">
                                {isMe ? 'You' : selectedBuyerConv.buyer.name.split(' ')[0]}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {timeStr}
                              </span>
                            </div>
                            <div className={`p-3 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                              isMe 
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none' 
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Dynamic Input Bar (Hides if item is sold) */}
                {selectedProduct.status === 'sold' || selectedProduct.is_sold ? (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border-t border-red-200 text-center text-xs font-bold text-red-600 dark:text-red-400">
                    🔒 This listing is marked as sold. Chat interface is locked.
                  </div>
                ) : (
                  <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Reply to ${selectedBuyerConv.buyer.name.split(' ')[0]}...`}
                      className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-850 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-750 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-100"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={isSending}
                      className="p-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md flex items-center justify-center transform scale-100 hover:scale-105 transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-500">
                  <MessageSquareText className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-350">No Interested Buyers Yet</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-350">No Listings Selected</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}