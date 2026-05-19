import React, { useState } from 'react';
import { X, Send, ShieldCheck, Clock, Check, MessageSquareText, GraduationCap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ChatDrawer() {
  const { isChatOpen, setIsChatOpen, chats, activeChatId, setActiveChatId, sendMessage, user } = useApp();
  const [inputText, setInputText] = useState('');

  if (!isChatOpen) return null;

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText || !inputText.trim() || !activeChat) return;
    sendMessage(activeChat.id, inputText);
    setInputText('');
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
              <img src={chat.user.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
              <span>{chat.user.name.split(' ')[0]}</span>
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
                <img src={activeChat.user.avatar} alt={activeChat.user.name} className="w-10 h-10 rounded-2xl object-cover shadow-sm" />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    {activeChat.user.name}
                    {activeChat.user.isVerified && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-emerald-500" title="Verified" />}
                  </p>
                  <p className="text-slate-500 text-[10px]">{activeChat.user.branch} • {activeChat.user.year}</p>
                </div>
              </div>
              <div className="text-right text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-xl font-extrabold border border-indigo-200 dark:border-indigo-800">
                Item: ₹{activeChat.product.price}
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/60">
              {activeChat.messages.map((msg, index) => {
                const isMe = msg.sender === 'me';
                return (
                  <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-end space-x-1.5 max-w-[80%]">
                      {!isMe && <img src={activeChat.user.avatar} className="w-6 h-6 rounded-full object-cover mb-1" alt="" />}
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
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Reply to ${activeChat.user.name.split(' ')[0]}...`}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <button
                type="submit"
                className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md flex items-center justify-center transform hover:scale-105 transition-all"
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
