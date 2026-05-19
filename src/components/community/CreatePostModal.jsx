import React, { useState } from 'react';
import { X, Send, Sparkles, MessageSquarePlus, Tag, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CreatePostModal() {
  const { isCreatePostOpen, setIsCreatePostOpen, addPost, user } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Study help');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  if (!isCreatePostOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) return;

    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const newPost = {
      title,
      category,
      content,
      tags: tagsArray.length > 0 ? tagsArray : [category.replace(/\s+/g, '')]
    };

    addPost(newPost);
    setIsCreatePostOpen(false);

    // Reset
    setTitle('');
    setContent('');
    setTagsInput('');
  };

  const categories = ['Study help', 'Internship guidance', 'Exam discussions', 'Coding help', 'Events'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white relative">
          <button 
            onClick={() => setIsCreatePostOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md mb-2">
            <MessageSquarePlus className="w-3.5 h-3.5 text-pink-300" />
            <span>Campus Community Voice</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Start a Discussion</h2>
          <p className="text-purple-100 text-xs sm:text-sm mt-1">Ask questions, share internship experiences, or announce campus events.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Author notice */}
          <div className="flex items-center space-x-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover" />
            <div className="text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
                Posting as {user.name} 
                {user.isVerified && <ShieldCheck className="w-3.5 h-3.5 ml-1 text-emerald-500" title="Verified Student" />}
              </p>
              <p className="text-slate-500 dark:text-slate-400">{user.branch} • {user.year}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Discussion Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to prepare for 5th sem DBMS practical viva?"
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Select Channel</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 dark:text-slate-100"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Discussion Details / Question *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide enough details so seniors or classmates can give helpful answers..."
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              rows="5"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Tags (Comma separated)</label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="DBMS, Viva, 3rdYear, Practical"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreatePostOpen(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200"
            >
              Publish Post
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
