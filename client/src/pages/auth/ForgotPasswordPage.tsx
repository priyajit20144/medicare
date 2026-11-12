import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  HeartPulse,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  RotateCw,
  Home,
  Pill,
  Stethoscope,
  Heart,
  Building2,
  Star,
  Info,
  Headphones,
  Plus,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Wizard state: 1 = Email, 2 = OTP & New Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState(false);
  const [autoRedirectTimer, setAutoRedirectTimer] = useState(5);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Pre-fill email and token from URL params if present (e.g. from reset link)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (tokenParam && tokenParam.length === 6 && /^\d+$/.test(tokenParam)) {
      const digits = tokenParam.split('').slice(0, 6);
      while (digits.length < 6) digits.push('');
      setOtp(digits);
      setStep(2);
    }
  }, [searchParams]);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  // Auto-redirect timer on success screen
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (step === 3 && autoRedirectTimer > 0) {
      timer = setInterval(() => {
        setAutoRedirectTimer((prev) => {
          if (prev <= 1) {
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, autoRedirectTimer, navigate]);

  // ===========================================================================
  // Step 1: Send OTP to User's Email
  // ===========================================================================
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);

    try {
      const res: any = await api.post('/auth/forgot-password', {
        email: cleanEmail,
      });

      const message =
        res?.message ||
        `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`;
      setSuccessNotice(message);
      setStep(2);
      setCountdown(60);
      setCanResend(false);

      // Auto-focus first OTP digit box after state transition
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);

      // In dev mode, if server provides devOtpHint, log for convenient developer inspection
      const devOtp = res?.devOtpHint || res?.data?.devOtpHint;
      if (devOtp && String(devOtp).length === 6) {
        console.log(`[Medicare Security] Development OTP Code: ${devOtp}`);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to request verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================================
  // OTP Digits Input Handler (Supports auto-advance, backspace, and paste)
  // ===========================================================================
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next box if digit was typed
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    setOtp(newOtp);

    // Focus on the next empty box or the last box
    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // ===========================================================================
  // Resend OTP Action
  // ===========================================================================
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError(null);
    setLoading(true);

    try {
      const res: any = await api.post('/auth/forgot-password', { email: email.trim() });
      const message =
        res?.message ||
        `A fresh 6-digit code has been dispatched to ${email.trim()}. Please check your inbox.`;
      setSuccessNotice(message);
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  // ===========================================================================
  // Step 2: Verify OTP & Reset Password
  // ===========================================================================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otp.join('').trim();
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: fullOtp,
        token: fullOtp,
        newPassword,
      });

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, text: 'Good', color: 'bg-teal-500' };
    return { score: 100, text: 'Strong', color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 selection:bg-emerald-500 selection:text-white relative overflow-x-clip font-sans">
      {/* ==================================================================== */}
      {/* 1. TOP NAVIGATION BAR                                                */}
      {/* ==================================================================== */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none truncate">
                Medicare
              </span>
              <span className="hidden sm:block text-[11px] font-semibold text-emerald-600 tracking-wide mt-1 truncate">
                Your Health, Our Priority
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 text-xs font-semibold text-slate-600 min-w-0">
            <Link to="/" className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap">
              <Home className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Home</span>
            </Link>
            <Link to="/medicines" className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap">
              <Pill className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Medicines</span>
            </Link>
            <Link to="/doctors" className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Doctors</span>
            </Link>
            <Link to="/health-checkups" className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap">
              <Heart className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span><span className="hidden xl:inline">Health </span>Checkups</span>
            </Link>
            <Link to="/facilities" className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Facilities</span>
            </Link>
            <Link to="/premium" className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 flex-shrink-0" />
              <span>Premium</span>
            </Link>
            <Link to="/about" className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap">
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>About</span>
            </Link>
            <Link to="/contact" className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap">
              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Contact</span>
            </Link>
          </nav>

          {/* Right Header Action: Return to Login */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-200/90 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 transition-all text-xs font-bold text-slate-700 hover:text-emerald-700 shadow-sm flex-shrink-0 whitespace-nowrap group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden xs:inline">Back to Login</span>
              <span className="xs:hidden">Login</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 py-2">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50">
                <Home className="w-4 h-4 text-emerald-600" /> Home
              </Link>
              <Link to="/medicines" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50">
                <Pill className="w-4 h-4 text-emerald-600" /> Medicines
              </Link>
              <Link to="/doctors" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50">
                <Stethoscope className="w-4 h-4 text-emerald-600" /> Doctors
              </Link>
              <Link to="/health-checkups" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50">
                <Heart className="w-4 h-4 text-emerald-600" /> Checkups
              </Link>
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50">
                <Info className="w-4 h-4 text-emerald-600" /> About
              </Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50">
                <Mail className="w-4 h-4 text-emerald-600" /> Contact
              </Link>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                Sign In to Account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* 2. RECOVERY WORKFLOW CONTAINER                                       */}
      {/* ==================================================================== */}
      <main className="flex-1 relative flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft Background Hospital & Cyan Tint Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/30 pointer-events-none" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Wave Graphic at Bottom Left */}
        <div className="absolute bottom-0 left-0 w-full max-w-[700px] h-[220px] pointer-events-none select-none z-0">
          <svg className="w-full h-full" viewBox="0 0 700 220" fill="none" preserveAspectRatio="none">
            <path d="M-40 220C100 160 220 130 380 170C540 210 600 120 720 100V220H-40Z" fill="#0d9488" fillOpacity="0.35" />
            <path d="M-20 220C80 150 180 120 320 180C440 230 520 160 660 120V220H-20Z" fill="#045660" />
          </svg>
        </div>

        {/* Central Floating Recovery Card */}
        <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-2xl shadow-slate-300/40 border border-slate-100 p-4 sm:p-9 relative z-20">
          {/* Top Wizard Step Indicators */}
          <div className="flex items-center justify-between mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-slate-100 gap-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black transition-colors ${step === 1 ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-emerald-100 text-emerald-800'
                  }`}
              >
                1
              </div>
              <span className={`text-[11px] sm:text-xs font-bold whitespace-nowrap ${step === 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                Email
              </span>
            </div>

            <div className="flex-1 mx-1 sm:mx-3 h-0.5 bg-slate-100 relative min-w-[10px]">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
              />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black transition-colors ${step === 2 ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : step === 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                  }`}
              >
                2
              </div>
              <span className={`text-[11px] sm:text-xs font-bold whitespace-nowrap ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                OTP & Reset
              </span>
            </div>

            <div className="flex-1 mx-1 sm:mx-3 h-0.5 bg-slate-100 relative min-w-[10px]">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: step === 3 ? '100%' : '0%' }}
              />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black transition-colors ${step === 3 ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : 'bg-slate-100 text-slate-400'
                  }`}
              >
                3
              </div>
              <span className={`text-[11px] sm:text-xs font-bold whitespace-nowrap ${step === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                Success
              </span>
            </div>
          </div>

          {/* Feedback Notices */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-5 p-3.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
              <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{successNotice}</span>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 1: Enter Email & Request OTP                                */}
          {/* ================================================================ */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Forgot Password?
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 leading-relaxed">
                  Enter your verified registered email address and we will dispatch a secure 6-digit one-time password (OTP) code directly to your email.
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label htmlFor="recovery-email-input" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Registered Email Address</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="recovery-email-input"
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Dispatching OTP...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send 6-Digit OTP Code <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </button>
              </form>

              {/* Quick Demo Helper */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Testing with demo accounts?
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEmail('priyajitd80@gmail.com')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-mono transition"
                  >
                    priyajitd80@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmail('kayaroy345@gmail.com')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-mono transition"
                  >
                    kayaroy345@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmail('doctor@medicare.demo')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-mono transition"
                  >
                    doctor@medicare.demo
                  </button>
                </div>
              </div>

              <div className="text-center pt-1">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 2: Enter OTP & New Password                                 */}
          {/* ================================================================ */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mx-auto mb-3.5 shadow-sm">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Enter Verification Code
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 leading-relaxed">
                  We've dispatched a 6-digit verification code to{' '}
                  <span className="font-extrabold text-slate-900 break-all">{email}</span>.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    className="text-emerald-600 font-bold hover:underline ml-1"
                  >
                    Wrong email?
                  </button>
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* 6-Digit OTP Box Grid */}
                <div>
                  <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                      <span>6-Digit OTP Code</span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Valid for 15 minutes
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-13 sm:w-13 sm:h-14 text-center text-xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono shadow-sm"
                      />
                    ))}
                  </div>

                  {/* Resend Countdown Strip */}
                  <div className="flex items-center justify-between text-xs mt-2.5 pt-1 text-slate-500">
                    <span>Didn't receive code?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" /> Resend OTP
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">
                        Resend in <strong className="text-slate-700">{countdown}s</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* New Password Field */}
                <div className="pt-2 border-t border-slate-100">
                  <label htmlFor="new-password-input" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>New Password</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="new-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Security Strength:</span>
                        <span className="font-bold text-slate-700">{strength.text}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirm-password-input" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Confirm New Password</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="confirm-password-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full pl-10 pr-10 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {confirmPassword && (
                    <div className="mt-1 text-[11px] font-semibold">
                      {newPassword === confirmPassword ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying & Updating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Verify OTP & Reset Password
                    </span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ================================================================ */}
          {/* STEP 3: Success Confirmation                                     */}
          {/* ================================================================ */}
          {step === 3 && (
            <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-18 h-18 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 border-4 border-white">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Password Reset Successfully!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Your Medicare account password has been updated securely. A confirmation notification has also been sent to your registered email.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 font-medium">
                Redirecting you to the sign-in screen in{' '}
                <strong className="font-mono text-emerald-900">{autoRedirectTimer} seconds</strong>...
              </div>

              <Link
                to="/login"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 inline-flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Subtle Watermark Cross */}
        <div className="absolute -bottom-8 right-3 text-emerald-300/30 pointer-events-none select-none z-10">
          <Plus className="w-24 h-24 stroke-[4]" />
        </div>
      </main>

      {/* ==================================================================== */}
      {/* 3. BOTTOM TRUST & METRICS BAR                                        */}
      {/* ==================================================================== */}
      <footer className="w-full bg-[#e9f9f6] border-t border-emerald-100/80 py-3.5 px-4 sm:px-8 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-y-2 gap-x-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Trusted by 1M+ Users</span>
          </div>
          <div className="hidden md:block h-3.5 w-px bg-emerald-200/80" />
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>24/7 Support</span>
          </div>
          <div className="hidden md:block h-3.5 w-px bg-emerald-200/80" />
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-emerald-600 fill-emerald-600 flex-shrink-0" />
            <span>Rated 4.8/5</span>
          </div>
          <div className="hidden md:block h-3.5 w-px bg-emerald-200/80" />
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600/30 flex-shrink-0" />
            <span>Better Health. Happier Life.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
