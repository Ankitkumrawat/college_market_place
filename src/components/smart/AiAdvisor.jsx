import React from 'react';
import { Sparkles, Bot, GraduationCap, ArrowUpRight, CheckCircle2, Bookmark, Lightbulb, Compass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProductCard from '../marketplace/ProductCard';

export default function AiAdvisor() {
  const { user, aiStudyResources, products } = useApp();

  // Filter top 3 recommended products based on student's branch
  const recommendedProducts = products.filter(p => p.tags.some(t => user.branch.toLowerCase().includes(t.toLowerCase()) || t.includes("Engineering") || t.includes("Math"))).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
      
      {/* AI Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-purple-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '5s' }} />
              <span>Campus AI Study Advisor</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Personalized Recommendations for <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">{user.branch}</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
              Our smart recommendation engine analyzes your batch curriculum ({user.year}) and marketplace trends to suggest high-scoring study guides and necessary lab tools.
            </p>
          </div>

          {/* Student Batch Overview Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex flex-col items-center sm:items-start space-y-3 flex-shrink-0 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl text-white shadow">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">AI Profile Assessment</p>
                <p className="text-lg font-black">{user.name}</p>
                <p className="text-xs text-slate-300">{user.collegeId}</p>
              </div>
            </div>
            <div className="w-full pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Syllabus Aligned</span>
              <span>Semester 6 Focus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Marketplace Gear */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">Smart Gear Match</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Highly relevant items currently listed for sale by seniors in your branch</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {recommendedProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      {/* AI Curated Study Resources */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">AI Curated Study Guides & Roadmaps</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Handpicked resources based on recent campus exam discussions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiStudyResources.map((res) => (
            <div key={res.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl border border-purple-200 dark:border-purple-800/60">
                    {res.type}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-lg border border-emerald-500/30 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" /> {res.matchRatio}
                  </span>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {res.reason}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">{res.tag}</span>
                <button className="flex items-center space-x-1 font-bold text-purple-600 dark:text-purple-400 hover:underline">
                  <span>Access Guide</span> <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
