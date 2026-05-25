import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login, googleLogin } = useAuth();
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

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    
    const nameInput = window.prompt("Enter your name to simulate Google Account sign-in:", "Rahul Sharma");
    if (!nameInput) return;
    
    const emailInput = window.prompt("Enter your student email to simulate Google Account email verification:", "rahul.sharma@college.edu");
    if (!emailInput) return;

    if (!emailInput.includes('@')) {
      setError("Invalid email address format.");
      return;
    }

    try {
      const mockToken = `mock-google-token-${Date.now()}`;
      const result = await googleLogin(mockToken, emailInput, nameInput);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Google Login failed on backend.");
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

          {/* Continue with Google button */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase">Or</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-white hover:bg-slate-50 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm border-2 border-indigo-600/20 hover:border-indigo-600/40 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm relative"
          >
            {/* Google G Logo Icon */}
            <svg className="w-5 h-5 mr-3 absolute left-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
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
