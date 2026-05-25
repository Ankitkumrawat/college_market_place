import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import { API_URL } from '../../config';

// Safe markdown parser helper
const parseInlineCode = (text) => {
  const codeParts = text.split(/(`.*?`)/g);
  return codeParts.map((cPart, cIdx) => {
    if (cPart.startsWith('`') && cPart.endsWith('`')) {
      return (
        <code 
          key={cIdx} 
          className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs rounded border border-slate-200 dark:border-slate-700 font-semibold"
        >
          {cPart.slice(1, -1)}
        </code>
      );
    }
    return cPart;
  });
};

const parseInlineFormatting = (text) => {
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith('**') && bPart.endsWith('**')) {
      const boldText = bPart.slice(2, -2);
      return (
        <strong key={bIdx} className="font-bold text-slate-900 dark:text-white">
          {parseInlineCode(boldText)}
        </strong>
      );
    }
    return <span key={bIdx}>{parseInlineCode(bPart)}</span>;
  });
};

const renderMarkdown = (text) => {
  if (!text) return null;

  // Split by code blocks: ```code```
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/) || part.match(/```([\s\S]*?)```/);
      const language = match && match[2] ? match[1] : '';
      const code = match ? (match[2] || match[1]) : '';
      
      return (
        <div key={index} className="my-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          {language && (
            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 font-mono flex justify-between items-center select-none border-b border-slate-200 dark:border-slate-800">
              <span>{language}</span>
            </div>
          )}
          <pre className="p-3 bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
            <code>{code.trim()}</code>
          </pre>
        </div>
      );
    }

    const lines = part.split('\n');
    return (
      <div key={index} className="space-y-2">
        {lines.map((line, lineIdx) => {
          // Check for bullet list item: e.g., - item or * item
          const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)/);
          if (bulletMatch) {
            return (
              <ul key={lineIdx} className="list-disc pl-5 my-1.5 text-sm text-slate-600 dark:text-slate-300">
                <li className="leading-relaxed">{parseInlineFormatting(bulletMatch[2])}</li>
              </ul>
            );
          }
          
          // Check for numbered list item: e.g., 1. item
          const numMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
          if (numMatch) {
            return (
              <ol key={lineIdx} className="list-decimal pl-5 my-1.5 text-sm text-slate-600 dark:text-slate-300">
                <li className="leading-relaxed">{parseInlineFormatting(numMatch[2])}</li>
              </ol>
            );
          }

          if (line.trim() === '') {
            return <div key={lineIdx} className="h-1.5" />;
          }

          return (
            <p key={lineIdx} className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {parseInlineFormatting(line)}
            </p>
          );
        })}
      </div>
    );
  });
};

export default function CampusBuddyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('campus_buddy_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved messages', e);
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Hey there! 👋 I\'m **Campus Buddy**, your AI marketplace assistant. Ask me anything about textbooks, selling items, finding matching deals, or understanding community guidelines!',
        timestamp: new Date().toISOString()
      }
    ];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('campus_buddy_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    if (!textToSend) {
      setInputValue('');
    }
    
    setError(null);
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/ai/chatbot`, { prompt: text });
      
      const aiReply = response.data?.reply || response.data?.response || 'Sorry, I couldn\'t process that request.';
      
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Error posting to chatbot API:', err);
      
      // Provide a helpful fallback description for placeholder routes
      const isPlaceholder = err.response?.status === 404;
      const errorMsg = isPlaceholder 
        ? "I received your request, but the chatbot endpoint is currently offline or not configured yet. Here's what I would suggest: Double check your network configuration or try again in a few moments!"
        : "Failed to connect to Campus Buddy. Please check your backend connection.";
        
      setError(errorMsg);
      setMessages(prev => [...prev, {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Connection Error**\n\n${errorMsg}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    const defaultMsg = [
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Hey there! 👋 I\'m **Campus Buddy**, your AI marketplace assistant. Ask me anything about textbooks, selling items, finding matching deals, or understanding community guidelines!',
        timestamp: new Date().toISOString()
      }
    ];
    setMessages(defaultMsg);
    localStorage.setItem('campus_buddy_messages', JSON.stringify(defaultMsg));
    setError(null);
  };

  const quickPrompts = [
    "📖 Find engineering textbooks",
    "💰 How do I list a laptop?",
    "🛡️ Safe transaction tips",
    "🤝 What is AI Matchmaking?"
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="campus-buddy-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800"
        aria-label="Toggle Campus Buddy AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6 animate-fade-in" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
            </span>
          </div>
        )}
      </button>

      {/* Slide-out Chat Panel */}
      <div
        id="campus-buddy-chat-panel"
        className={`fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[420px] h-[600px] max-h-[75vh] glass-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ease-out transform origin-bottom-right ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <Bot className="w-5 h-5 text-indigo-100" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 border border-indigo-600 rounded-full animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm tracking-wide font-sans">Campus Buddy</h3>
                <span className="bg-white/20 text-[9px] uppercase px-1.5 py-0.5 rounded-full font-extrabold tracking-wider">AI</span>
              </div>
              <span className="text-xs text-indigo-100/90 font-medium">Your marketplace assistant</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-1.5 hover:bg-white/15 rounded-lg text-indigo-100 hover:text-white transition-colors duration-200"
              title="Reset conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/15 rounded-lg text-indigo-100 hover:text-white transition-colors duration-200"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((message) => {
            const isAI = message.sender === 'ai';
            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-[85%] ${
                  isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isAI
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-900 dark:text-indigo-400'
                      : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-3 rounded-2xl shadow-sm ${
                    isAI
                      ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-tl-none'
                      : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}
                >
                  {isAI ? (
                    <div className="prose prose-sm dark:prose-invert">
                      {renderMarkdown(message.text)}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}
                  
                  {/* Timestamp */}
                  <span
                    className={`block text-[9px] mt-1.5 text-right ${
                      isAI ? 'text-slate-400 dark:text-slate-500' : 'text-indigo-200'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-900 dark:text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Campus Buddy is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Action Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto flex gap-2 select-none no-scrollbar">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSend(prompt.slice(2))} // Remove the emoji
              disabled={isLoading}
              className="shrink-0 text-xs px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none font-medium shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-all duration-200">
            <textarea
              rows="1"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Campus Buddy..."
              disabled={isLoading}
              className="flex-1 bg-transparent py-3 pl-4 pr-12 text-sm max-h-24 resize-none focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 transition-all duration-200"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
