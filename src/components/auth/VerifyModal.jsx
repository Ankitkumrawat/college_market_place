import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles, Check, GraduationCap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function VerifyModal() {
  const { isVerifyModalOpen, setIsVerifyModalOpen, user, verifyStudent } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isVerifyModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!emailInput.endsWith('.edu') && !emailInput.endsWith('.ac.in')) {
      setError('Please enter a valid university email address ending in .edu or .ac.in');
      return;
    }

    const res = verifyStudent(emailInput);
    if (res) {
      setSuccess(true);
      setTimeout(() => {
        setIsVerifyModalOpen(false);
        setSuccess(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsVerifyModalOpen(false)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 sm:p-8 text-center space-y-3 bg-gradient-to-b from-emerald-50 dark:from-emerald-950/30 to-transparent">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce-subtle">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Student ID Verification</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Get your verified green tick to build trust and trade confidently inside your university campus.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 pt-0 space-y-6">
          {success ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2 animate-scale-up">
              <Check className="w-8 h-8 text-emerald-600 mx-auto bg-emerald-100 dark:bg-emerald-900 p-1.5 rounded-full" />
              <h4 className="font-bold text-emerald-800 dark:text-emerald-200">Verification Successful!</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-300">Your student badge is now active across all your marketplace listings and community posts.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">University Email Address *</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. ankit.cse24@college.edu"
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">We never send spam. Used solely for college domain verification.</span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200"
              >
                Get Verified Student Badge
              </button>
            </form>
          )}

          {/* Current status display */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Status:</span>
            {user.isVerified ? (
              <span className="font-bold text-emerald-600 flex items-center"><ShieldCheck className="w-4 h-4 mr-1" /> Active Student ID</span>
            ) : (
              <span className="font-bold text-amber-500">Unverified Account</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
