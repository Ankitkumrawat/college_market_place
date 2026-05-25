import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, BookOpen, Calendar, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register, verifyOtp, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('Computer Science Engg.');
  const [year, setYear] = useState('1st Year');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

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
        if (result.requires_otp) {
          setTimeout(() => {
            setSuccess('');
            setShowOtpScreen(true);
          }, 1500);
        } else {
          setTimeout(() => {
            setSuccess('');
            navigate('/');
          }, 1500);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      if (err.response?.data?.detail === 'ALREADY_REGISTERED') {
        setSuccess("Email is already registered. Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorMsg = err.response?.data?.detail || "Registration request failed. Please check your connection.";
        setError(Array.isArray(errorMsg) ? errorMsg.map(e => e.msg).join(', ') : errorMsg);
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyOtp(email, otp);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("OTP Verification failed. Please check your connection.");
    } finally {
      setIsVerifying(false);
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
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 font-display">
            {showOtpScreen ? "Verify Email" : "Create Campus ID"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {showOtpScreen 
              ? "We sent a 6-digit OTP code to verify your email address." 
              : "Join the peer-to-peer student marketplace. Register using any email address, including your personal Gmail."}
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
            <span>{success}</span>
          </div>
        )}

        {showOtpScreen ? (
          /* OTP Verification Screen */
          <form onSubmit={handleOtpSubmit} className="space-y-6 relative z-10 animate-fade-in">
            <div className="text-center space-y-2">
              <span className="inline-flex p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-100 dark:border-purple-900/60 mb-2">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                A 6-digit OTP code has been sent to your email:
              </p>
              <p className="text-sm font-extrabold text-purple-600 dark:text-purple-400 break-all">
                {email}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block text-center">
                Enter Verification Code *
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center px-4 py-3 bg-slate-100 dark:bg-slate-900/80 text-xl tracking-[0.5em] rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-black text-slate-800 dark:text-slate-100 placeholder:opacity-40"
                required
                disabled={isVerifying}
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-extrabold text-sm shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 flex items-center justify-center transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isVerifying ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Verifying Code...
                </>
              ) : (
                <>
                  <span>Verify OTP & Launch Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowOtpScreen(false);
                setOtp('');
                setError('');
                setSuccess('');
              }}
              className="w-full py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-center"
            >
              Back to Registration
            </button>
          </form>
        ) : (
          /* Registration Form */
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul.verma@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900/80 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 dark:text-slate-100"
                  required
                />
              </div>
              {email && email.includes('@') && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Eligible for instant verified student badge!
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
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900/80 text-sm rounded-2xl border border-slate-200/70 dark:border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 dark:text-slate-100"
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
                    className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-900/80 text-sm rounded-2xl border border-slate-200/70 dark:border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium text-slate-800 dark:text-slate-100"
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
        )}

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
