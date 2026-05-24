import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Login request failed. Please check your connection.");
    }
  };

  const handleDemoLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xl p-8 sm:p-10 space-y-8 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center space-y-3 relative z-10">
          <Link to="/" className="inline-flex p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 text-white transform hover:rotate-6 transition-transform duration-200 mx-auto">
            <GraduationCap className="w-8 h-8" />
          </Link>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Log in to your verified campus marketplace and community dashboard.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/80 text-red-600 dark:text-red-400 text-xs rounded-2xl flex items-center animate-slide-up">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/80 text-emerald-600 dark:text-emerald-400 text-xs rounded-2xl flex items-center animate-slide-up">
            <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{success} Redirecting to campus...</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">College Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ankit.cse@college.edu"
                className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900/80 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-slate-100 dark:bg-slate-900/80 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 dark:text-slate-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 flex items-center justify-center transform hover:-translate-y-0.5"
          >
            <span>Access Student Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>

        </form>

        {/* Demo Credentials Box */}
        <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 text-xs space-y-2 relative z-10">
          <div className="flex items-center text-indigo-950 dark:text-indigo-200 font-bold">
            <Sparkles className="w-4 h-4 mr-1 text-indigo-600 dark:text-indigo-400" />
            <span>Fast Demo Credentials</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">Click any preset below to auto-fill credentials:</p>
          <div className="flex flex-wrap gap-2">
            <button 
              type="button" 
              onClick={() => handleDemoLogin('ankit.cse@college.edu')}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-800 font-bold text-[11px] hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-sm"
            >
              Ankit (3rd Yr CSE)
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin('aarav.cs22@college.edu')}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-indigo-800 font-bold text-[11px] hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-sm"
            >
              Aarav (4th Yr Senior)
            </button>
          </div>
        </div>

        {/* Footer link */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>New to CampusConnect? </span>
          <Link to="/register" className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline ml-1">
            Register Student ID
          </Link>
        </div>

      </div>
    </div>
  );
}
