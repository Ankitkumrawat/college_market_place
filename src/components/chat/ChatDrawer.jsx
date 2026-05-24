import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldCheck, Clock, Check, MessageSquareText, GraduationCap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { API_URL } from '../../config';

export default function ChatDrawer() {
  const { isChatOpen, setIsChatOpen, chats, activeChatId, setActiveChatId, fetchConversations, user } = useApp();
  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState([]);
  const socketRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // Sync local messages state when active conversation or global chats change
  useEffect(() => {
    if (activeChat) {
      setLocalMessages(activeChat.messages || []);
    } else {
      setLocalMessages([]);
    }
  }, [activeChatId, chats]);

  // Handle WebSocket Connection Lifecycle
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isChatOpen || !activeChat) return;

    let ws = null;
    try {
      const wsHost = API_URL.replace(/^https?:\/\//, '');
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProto}//${wsHost}/api/chat/ws/${token}`;
      
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Match active partner ID from activeChatId key format (chat_{partnerId}_{productId})
          const parts = activeChat.id.replace('chat_', '').split('_');
          const partnerId = parseInt(parts[0], 10);
          
          const isFromActivePartner = data.sender_id === partnerId || data.receiver_id === partnerId;
          
          if (isFromActivePartner) {
            const formattedMsg = {
              sender: data.sender_id === user.id ? 'me' : 'them',
              text: data.text,
              time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setLocalMessages(prev => [...prev, formattedMsg]);
          }

          // Background sync to update sidebar / unread counters
          if (fetchConversations) {
            fetchConversations();
          }
        } catch (e) {
          console.error("Failed to parse incoming WS text:", e);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket chat drawer connection closed.");
      };

    } catch (err) {
      console.error("Websocket initialization failed in ChatDrawer:", err);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [activeChatId, isChatOpen]);

  if (!isChatOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText || !inputText.trim() || !activeChat || !socketRef.current) return;
    
    const text = inputText.trim();
    
    // Parse partnerId and productId from activeChatId key format chat_{partnerId}_{productId}
    const parts = activeChat.id.replace('chat_', '').split('_');
    const partnerId = parseInt(parts[0], 10);
    const productId = parts[1] && parts[1] !== '0' ? parseInt(parts[1], 10) : null;

    if (socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        receiver_id: partnerId,
        product_id: productId,
        text: text
      }));
    } else {
      console.error("WebSocket is not open. Connection state:", socketRef.current.readyState);
    }
    
    setInputText('');
  };

  const getPartnerAvatar = (chatUser) => {
    return chatUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";
  };

  const isUserVerified = (chatUser) => {
    if (!chatUser) return false;
    return chatUser.is_verified !== undefined ? chatUser.is_verified : chatUser.isVerified;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-slide-up">
        
        {/* Chat Drawer Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquareText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg flex items-center">
                Student Intercom
              </h3>
              <p className="text-xs text-indigo-100 font-medium">Campus peer-to-peer secure messaging</p>
            </div>
          </div>
          <button 
            onClick={() => setIsChatOpen(false)}
            className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Selector / Header */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeChat?.id === chat.id 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
              }`}
            >
              <img src={getPartnerAvatar(chat.user)} className="w-5 h-5 rounded-full object-cover" alt="" />
              <span>{chat.user?.name ? chat.user.name.split(' ')[0] : 'Student'}</span>
              {chat.unread && <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>}
            </button>
          ))}
        </div>

        {/* Chat Body */}
        {activeChat ? (
          <>
            {/* Active User Info Banner */}
            <div className="p-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={getPartnerAvatar(activeChat.user)} alt={activeChat.user?.name} className="w-10 h-10 rounded-2xl object-cover shadow-sm" />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    {activeChat.user?.name || 'Student'}
                    {isUserVerified(activeChat.user) && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-emerald-500" title="Verified" />}
                  </p>
                  <p className="text-slate-500 text-[10px]">
                    {activeChat.user?.branch || 'Branch'} • {activeChat.user?.year || 'Batch'}
                  </p>
                </div>
              </div>
              {activeChat.product && (
                <div className="text-right text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-xl font-extrabold border border-indigo-200 dark:border-indigo-800 max-w-[150px] truncate" title={activeChat.product.title}>
                  ₹{activeChat.product.price} • {activeChat.product.title}
                </div>
              )}
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/60">
              {localMessages && localMessages.length > 0 ? (
                localMessages.map((msg, index) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-end space-x-1.5 max-w-[80%]">
                        {!isMe && <img src={getPartnerAvatar(activeChat.user)} className="w-6 h-6 rounded-full object-cover mb-1" alt="" />}
                        <div className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium shadow-sm leading-relaxed ${
                          isMe 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No messages yet. Send a message to start the conversation!
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={activeChat.user?.name ? `Reply to ${activeChat.user.name.split(' ')[0]}...` : 'Type a message...'}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <button
                type="submit"
                className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md flex items-center justify-center transform scale-100 hover:scale-105 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <MessageSquareText className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm font-bold">No active conversations</p>
            <p className="text-xs mt-1">Start a chat by clicking "Chat Seller" on any item listing.</p>
          </div>
        )}

      </div>
    </div>
  );
}
