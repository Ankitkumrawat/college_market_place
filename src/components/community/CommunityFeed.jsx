import React, { useState, useMemo } from 'react';
import { 
  MessageSquareText, ThumbsUp, PlusCircle, ShieldCheck, 
  Send, Sparkles, UserCheck, Flame, BookOpen, Briefcase, Award, Code, Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CreatePostModal from './CreatePostModal';

export default function CommunityFeed() {
  const { posts, upvotePost, addComment, setIsCreatePostOpen, user } = useApp();
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);

  const channels = [
    { name: 'All', icon: <Flame className="w-4 h-4 mr-1.5" /> },
    { name: 'Study help', icon: <BookOpen className="w-4 h-4 mr-1.5" /> },
    { name: 'Internship guidance', icon: <Briefcase className="w-4 h-4 mr-1.5" /> },
    { name: 'Exam discussions', icon: <Award className="w-4 h-4 mr-1.5" /> },
    { name: 'Coding help', icon: <Code className="w-4 h-4 mr-1.5" /> },
    { name: 'Events', icon: <Calendar className="w-4 h-4 mr-1.5" /> }
  ];

  const filteredPosts = useMemo(() => {
    return posts.filter(post => selectedChannel === 'All' || post.category === selectedChannel);
  }, [posts, selectedChannel]);

  const handleCommentSubmit = (postId, e) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    addComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Community Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold backdrop-blur-md">
              <UserCheck className="w-3.5 h-3.5 text-pink-300" />
              <span>Seniors & Juniors Collab Hub</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Campus <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">Discussions & Guidance</span>
            </h1>
            <p className="text-slate-300 text-sm font-normal">
              Get doubt clearances, FAANG interview tips from seniors, exam question patterns, and find hackathon teammates instantly.
            </p>
          </div>

          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl font-extrabold text-sm flex items-center shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 transform hover:-translate-y-0.5 flex-shrink-0"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Start Discussion
          </button>
        </div>

        {/* Channels Toolbar */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center space-x-2 overflow-x-auto pb-2 scroll-smooth no-scrollbar">
          {channels.map((chan) => (
            <button
              key={chan.name}
              onClick={() => setSelectedChannel(chan.name)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center whitespace-nowrap transition-all duration-200 ${
                selectedChannel === chan.name
                  ? 'bg-white text-purple-950 shadow-lg shadow-white/10 scale-105'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {chan.icon}
              {chan.name}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
            <MessageSquareText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">No discussions in this channel yet</h3>
            <p className="text-sm text-slate-500 mb-6">Be the first to ask a question or share advice with your college batch!</p>
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm shadow hover:bg-purple-700"
            >
              Create First Post
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm p-6 sm:p-8 space-y-6 hover:shadow-md transition-shadow">
              
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <img src={post.author.avatar} alt={post.author.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{post.author.name}</span>
                      {post.author.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" title="Verified Student" />}
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-[10px] font-extrabold uppercase">
                        {post.author.year}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{post.author.branch} • {post.createdAt}</span>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl border border-purple-200 dark:border-purple-800/60">
                  {post.category}
                </span>
              </div>

              {/* Title & Content */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100 leading-snug">{post.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map(t => (
                    <span key={t} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-lg font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Interactions Toolbar */}
              <div className="flex items-center space-x-6 pt-4 border-t border-slate-100 dark:border-slate-700/80">
                <button
                  onClick={() => upvotePost(post.id)}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-extrabold text-xs sm:text-sm group transition-colors"
                >
                  <div className="p-2 bg-slate-100 dark:bg-slate-700/80 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-600">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                  <span>{post.upvotes} Upvotes</span>
                </button>

                <button
                  onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                  className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-extrabold text-xs sm:text-sm group transition-colors"
                >
                  <div className="p-2 bg-slate-100 dark:bg-slate-700/80 rounded-xl group-hover:bg-purple-50 dark:group-hover:bg-purple-950/40 group-hover:text-purple-600">
                    <MessageSquareText className="w-4 h-4" />
                  </div>
                  <span>{post.comments.length} Comments</span>
                </button>
              </div>

              {/* Comments Section */}
              {activeCommentsPostId === post.id && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4 animate-slide-up">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discussion Comments ({post.comments.length})</h4>
                  
                  {/* List comments */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {post.comments.map(comm => (
                      <div key={comm.id} className="p-3.5 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{comm.author} ({comm.year})</span>
                          <span className="text-slate-400 text-[10px]">{comm.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{comm.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add comment input */}
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Add a comment or answer..."
                      className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-xs rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 dark:text-slate-100"
                    />
                    <button type="submit" className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          ))
        )}
      </div>

      <CreatePostModal />
    </div>
  );
}
