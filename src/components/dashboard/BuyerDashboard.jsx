import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Send, ShoppingBag, MessageSquareText, ShieldCheck, 
  ArrowLeft, Clock, Sparkles, User, Tag, HelpCircle, 
  CheckCircle2, ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

export default function BuyerDashboard() {
  const { currentUser } = useAuth();
  const { addNotification } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
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

  // Fetch conversations
  const fetchConversations = async (autoSelectId = null) => {
    setIsLoadingConversations(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoadingConversations(false);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/buyer/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
      
      // Auto-select logic
      if (res.data.length > 0) {
        // 1. Check if we have an autoSelectId argument
        // 2. Check if navigate location state has conversationId
        // 3. Fallback to selecting first conversation
        const targetId = autoSelectId || location.state?.conversationId;
        if (targetId) {
          const match = res.data.find(c => c.id === targetId);
          setSelectedConv(match || res.data[0]);
        } else if (!selectedConv) {
          setSelectedConv(res.data[0]);
        } else {
          // Keep currently selected conversation but update its details
          const match = res.data.find(c => c.id === selectedConv.id);
          if (match) setSelectedConv(match);
        }
      } else {
        setSelectedConv(null);
      }
    } catch (err) {
      console.error("Failed to fetch buyer dashboard conversations:", err);
      addNotification("Error", "Could not retrieve conversations list.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [location.state?.conversationId]);

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
      console.error("Failed to load message history:", err);
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
    if (!selectedConv) {
      setMessages([]);
      return;
    }

    // Load message history first
    fetchMessages(selectedConv.id);

    const token = localStorage.getItem('token');
    if (!token) return;

    let ws = null;
    try {
      const wsHost = API_URL.replace(/^https?:\/\//, '');
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProto}//${wsHost}/api/chat/ws/conversation/${selectedConv.id}/${token}`;

      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.conversation_id === selectedConv.id) {
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
            // Update conversation last message in listing
            setConversations(prev => 
              prev.map(c => c.id === selectedConv.id ? { ...c, last_message: data.text, last_message_time: data.time || "Just now" } : c)
            );
          }
        } catch (e) {
          console.error("Failed to parse incoming WS text:", e);
        }
      };

      ws.onclose = () => {
        console.log(`WebSocket closed for conversation: ${selectedConv.id}`);
      };

    } catch (err) {
      console.error("WebSocket initialization failed:", err);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [selectedConv?.id]);

  // Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText || !inputText.trim() || !selectedConv) return;
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
      const res = await axios.post(`${API_URL}/api/chat/conversations/${selectedConv.id}/messages`, {
        text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => {
        if (prev.some(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });

      // Update conversations list summary
      setConversations(prev => 
        prev.map(c => c.id === selectedConv.id ? { ...c, last_message: text, last_message_time: "Just now" } : c)
      );

      setInputText('');
    } catch (err) {
      console.error("REST fallback message send failed:", err);
      addNotification("Send Failed", "Could not send message. Check your connection.");
    } finally {
      setIsSending(false);
    }
  };

  const isUserVerified = (usr) => {
    if (!usr) return false;
    return usr.is_verified || usr.isVerified;
  };

  return (
    <div className="h-[75vh] flex rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-fade-in">
      
      {/* Left Conversations Sidebar */}
      <div className="w-1/3 sm:w-1/4 border-r border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-between">
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center uppercase">
              <ShoppingBag className="w-4 h-4 mr-2 text-indigo-500" />
              Buying List
            </h2>
          </div>

          {/* Conversations Navigation List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoadingConversations ? (
              <div className="text-center py-10 text-xs text-slate-400 font-medium animate-pulse">
                Loading dashboard...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 px-2 text-xs text-slate-400 space-y-3">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-350 opacity-60" />
                <p className="font-bold">No active buying chats</p>
                <p className="text-[10px] leading-relaxed">
                  Start checking out items in the marketplace to chat with sellers directly.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px]"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              conversations.map(conv => {
                const isActive = selectedConv?.id === conv.id;
                const prodImg = getProductImageUrl(conv.product);
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start space-x-3 ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-800'
                    }`}
                  >
                    {/* Product Thumbnail */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 border border-slate-100 dark:border-slate-700">
                      <img src={prodImg} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-black text-xs truncate ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                          {conv.product.title}
                        </h4>
                        {conv.unread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0 ml-1"></span>
                        )}
                      </div>
                      <p className={`text-[10px] font-bold ${isActive ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                        ₹{conv.product.price}
                      </p>
                      <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {conv.last_message || `Chat with ${conv.seller.name.split(' ')[0]}`}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* User Footer Profile */}
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
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0">
                  <img src={getProductImageUrl(selectedConv.product)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <h1 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 truncate">
                    {selectedConv.product.title}
                  </h1>
                  <p className="text-[10px] text-slate-500 dark:text-slate-405 flex items-center">
                    Seller: <span className="font-bold ml-1 text-slate-700 dark:text-slate-300">{selectedConv.seller.name}</span>
                    {isUserVerified(selectedConv.seller) && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-emerald-500" />}
                  </p>
                </div>
              </div>

              {/* Price Tag */}
              <div className="flex items-center bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-2xl border border-indigo-100 dark:border-indigo-900 flex-shrink-0">
                <Tag className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">₹{selectedConv.product.price}</span>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {isLoadingMessages ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse">
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-bounce" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-350">
                    Start negotiating with {selectedConv.seller.name.split(' ')[0]}!
                  </p>
                  <p className="text-[10px] text-slate-505 max-w-xs leading-relaxed">
                    Discuss meeting points, item quality, and final rates. Always meet in safe campus areas.
                  </p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === currentUser?.id;
                  const timeStr = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <div key={msg.id} className={`flex items-start space-x-3.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <img 
                        src={isMe ? currentUser.avatar : selectedConv.seller.avatar} 
                        alt="" 
                        className="w-8.5 h-8.5 rounded-xl object-cover shadow-sm flex-shrink-0" 
                      />
                      
                      <div className="max-w-[70%] space-y-0.5">
                        {/* Name and time details */}
                        <div className={`flex items-baseline space-x-2 text-[10px] ${isMe ? 'justify-end' : ''}`}>
                          <span className="font-extrabold text-slate-700 dark:text-slate-300">
                            {isMe ? 'You' : selectedConv.seller.name.split(' ')[0]}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {timeStr}
                          </span>
                        </div>
                        {/* Body bubble */}
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

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type a message to ${selectedConv.seller.name.split(' ')[0]}...`}
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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-500">
              <MessageSquareText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-350">No Buying Chat Selected</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select an active conversation on the left to start negotiating and chatting with the seller.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
