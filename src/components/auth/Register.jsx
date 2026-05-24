import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, BookOpen, Calendar, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('Computer Science Engg.');
  const [year, setYear] = useState('1st Year');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const branches = [
    'Computer Science Engg.',
    'Information Tech.',
    'Electronics & Comm.',
    'Electrical Engg.',
    'Mechanical Engg.',
    'Civil Engg.',
    'Chemical Engg.',
    'Biotech / Medical'
  ];

  const years = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year (Senior)',
    'Postgraduate / Masters',
    'Alumni / Faculty'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const result = await register(name, email, password, branch, year);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Registration request failed. Please check your connection.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-xl w-full bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xl p-8 sm:p-10 space-y-8 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center space-y-3 relative z-10">
          <Link to="/" className="inline-flex p-3 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/30 text-white transform hover:-rotate-6 transition-transform duration-200 mx-auto">
            <GraduationCap className="w-8 h-8" />
          </Link>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">Create Campus ID</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Join the peer-to-peer ecosystem. Use your university <code className="text-purple-600 font-bold bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded">.edu</code> email for instant verified student status.
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
            <span>{success} Entering campus marketplace...</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Full Name *</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900/80 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">College Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul.mech@college.edu"
                className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900/80 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 dark:text-slate-100"
                required
              />
            </div>
            {email && email.includes('@') && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Eligible for auto-verified student badge!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Branch / Major</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900/80 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 dark:text-slate-100"
                >
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Batch Year</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900/80 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 dark:text-slate-100"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Create Password *</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-11 pr-12 py-3 bg-slate-100 dark:bg-slate-900/80 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 dark:text-slate-100"
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
            className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 flex items-center justify-center transform hover:-translate-y-0.5"
          >
            <span>Register & Join Community</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>

        </form>

        {/* Footer link */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Already registered on campus? </span>
          <Link to="/login" className="font-extrabold text-purple-600 dark:text-purple-400 hover:underline ml-1">
            Log in here
          </Link>
        </div>

      </div>
    </div>
  );
}
