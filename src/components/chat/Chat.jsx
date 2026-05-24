import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Hash, Plus, Send, MessageSquareText, ShieldCheck, 
  Users, Trash2, HelpCircle, User, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

export default function Chat() {
  const { currentUser } = useAuth();
  const { addNotification } = useApp();
  
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch Channels on load
  const fetchChannels = async (autoSelectId = null) => {
    setIsLoadingChannels(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/chat/channels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannels(res.data);
      
      // Auto-select logic
      if (res.data.length > 0) {
        if (autoSelectId) {
          const target = res.data.find(c => c.id === autoSelectId);
          setSelectedChannel(target || res.data[0]);
        } else if (!selectedChannel) {
          setSelectedChannel(res.data[0]); // Auto-select #general
        }
      }
    } catch (err) {
      console.error("Failed to fetch channels:", err);
      addNotification("Error", "Could not retrieve chat channels.");
    } finally {
      setIsLoadingChannels(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // Fetch Messages for active channel
  const fetchMessages = async (channelId) => {
    setIsLoadingMessages(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/chat/channels/${channelId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load channel messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to channel WebSocket
  useEffect(() => {
    if (!selectedChannel) return;

    // Fetch messages first
    fetchMessages(selectedChannel.id);

    const token = localStorage.getItem('token');
    if (!token) return;

    let ws = null;
    try {
      const wsHost = API_URL.replace(/^https?:\/\//, '');
      const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProto}//${wsHost}/api/chat/ws/channel/${selectedChannel.id}/${token}`;

      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Only append if it belongs to currently selected channel
          if (data.channel_id === selectedChannel.id) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === data.id)) return prev;
              return [...prev, {
                id: data.id,
                channel_id: data.channel_id,
                sender_id: data.sender_id,
                sender: data.sender,
                text: data.text,
                created_at: data.created_at
              }];
            });
          }
        } catch (e) {
          console.error("Failed to parse incoming websocket text:", e);
        }
      };

      ws.onclose = () => {
        console.log(`Disconnected from channel: ${selectedChannel.name}`);
      };

    } catch (err) {
      console.error("WebSocket init failed:", err);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [selectedChannel]);

  // Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText || !inputText.trim() || !selectedChannel) return;
    const text = inputText.trim();

    const token = localStorage.getItem('token');
    if (!token) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({ text }));
        setInputText('');
      } catch (err) {
        console.error("WebSocket send error, falling back to HTTP:", err);
        sendViaHttp(text, token);
      }
    } else {
      sendViaHttp(text, token);
    }
  };

  const sendViaHttp = async (text, token) => {
    try {
      const res = await axios.post(`${API_URL}/api/chat/channels/${selectedChannel.id}/messages`, {
        text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Append manually in HTTP fallback
      setMessages(prev => {
        if (prev.some(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      setInputText('');
    } catch (err) {
      console.error("HTTP send message error:", err);
      addNotification("Send Failed", "Could not broadcast your message.");
    }
  };

  // Create Channel
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName || !newChannelName.trim()) return;

    let formattedName = newChannelName.trim();
    if (!formattedName.startsWith('#')) {
      formattedName = `#${formattedName}`;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_URL}/api/chat/channels`, {
        name: formattedName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addNotification("Channel Created", `Joined community room ${formattedName}.`);
      setNewChannelName('');
      setShowCreateForm(false);
      // Fetch and auto-select new channel
      await fetchChannels(res.data.id);
    } catch (err) {
      console.error("Failed to create channel:", err);
      addNotification("Creation Failed", err.response?.data?.detail || "Could not create channel.");
    }
  };

  const isUserVerified = (msgSender) => {
    if (!msgSender) return false;
    return msgSender.is_verified || msgSender.isVerified;
  };

  return (
    <div className="h-[75vh] flex rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-fade-in">
      
      {/* Channels List Sidebar */}
      <div className="w-1/3 sm:w-1/4 border-r border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col justify-between">
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center uppercase">
              <Users className="w-4 h-4 mr-2 text-indigo-500" />
              Community
            </h2>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-650 transition-colors"
              title="Create Room"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Create Channel Inline Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateChannel} className="p-3.5 bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 space-y-2 animate-slide-up">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g. #exam-prep"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setNewChannelName(''); }}
                  className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 rounded-lg text-[10px] font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Channels Navigation List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {isLoadingChannels ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading channels...</div>
            ) : channels.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No rooms available.</div>
            ) : (
              channels.map(chan => (
                <button
                  key={chan.id}
                  onClick={() => setSelectedChannel(chan)}
                  className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    selectedChannel?.id === chan.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-450 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Hash className={`w-4 h-4 mr-2 ${selectedChannel?.id === chan.id ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{chan.name.replace('#', '')}</span>
                </button>
              ))
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
        {selectedChannel ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2">
                <Hash className="w-5 h-5 text-indigo-500" />
                <h1 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                  {selectedChannel.name.replace('#', '')}
                </h1>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-750 dark:text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/60 font-bold uppercase tracking-wide">
                  Public Chat
                </span>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {isLoadingMessages ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse">
                  Retrieving room messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-bounce" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-350"># Welcome to {selectedChannel.name}!</p>
                  <p className="text-[10px] text-slate-500 max-w-xs">Be the first to speak! Share guidelines, thrift queries, or college discussions here.</p>
                </div>
              ) : (
                messages.map(msg => {
                  const sender = msg.sender || {};
                  const isMe = msg.sender_id === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex items-start space-x-3.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <img 
                        src={sender.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"} 
                        alt="" 
                        className="w-9 h-9 rounded-xl object-cover shadow-sm flex-shrink-0" 
                      />
                      <div className="max-w-[70%] space-y-1">
                        {/* Name and time details */}
                        <div className={`flex items-baseline space-x-2 text-[10px] sm:text-xs ${isMe ? 'justify-end' : ''}`}>
                          <span className="font-extrabold text-slate-805 dark:text-slate-205 flex items-center space-x-1">
                            <span>{sender.name || 'Student'}</span>
                            {isUserVerified(sender) && <ShieldCheck className="w-3 h-3 text-emerald-500 inline" />}
                          </span>
                          <span className="text-[9px] text-slate-450">
                            {sender.year || 'Student'}
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
                placeholder={`Message ${selectedChannel.name}...`}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-850 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-750 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <button
                type="submit"
                className="p-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md flex items-center justify-center transform scale-100 hover:scale-105 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8">
            <MessageSquareText className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm font-bold">No Room Selected</p>
            <p className="text-xs mt-1">Please select or create a community room on the left sidebar to start chatting.</p>
          </div>
        )}
      </div>

    </div>
  );
}
