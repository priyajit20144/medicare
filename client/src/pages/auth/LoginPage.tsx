import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  HeartPulse,
  Mail,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  LogOut,
  AlertCircle,
  Home,
  Pill,
  Stethoscope,
  Heart,
  Building2,
  Star,
  Info,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Headphones,
  Plus,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import {
  QUICK_HEALTH_SERVICES,
  QuickHealthService,
  getSafeReturnUrl,
  getDefaultDashboardRoute,
  findQuickServiceByRoute,
} from '../../constants/quickServices';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDemoLogins, setShowDemoLogins] = useState(false);

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const loginCardRef = useRef<HTMLDivElement | null>(null);

  const { user, isAuthenticated, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const returnUrl = getSafeReturnUrl(searchParams.get('returnUrl'));
  const selectedService = findQuickServiceByRoute(
    returnUrl !== '/user/dashboard' ? returnUrl : null
  );

  // Load remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('medicare_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSocialNotice(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post<{ token: string; user: any }>('/auth/login', {
        email: email.trim(),
        password,
      });

      // Handle remember me preference
      if (rememberMe) {
        localStorage.setItem('medicare_remembered_email', email.trim());
      } else {
        localStorage.removeItem('medicare_remembered_email');
      }

      setAuth(res.user, res.token);

      // Route to selected quick option/returnUrl, or role-appropriate dashboard
      if (returnUrl === '/user/dashboard') {
        navigate(getDefaultDashboardRoute(res.user?.role));
      } else {
        navigate(returnUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickServiceClick = (service: QuickHealthService) => {
    if (isAuthenticated && user) {
      navigate(service.route);
      return;
    }

    setError('');
    setSocialNotice(null);
    setSearchParams({ returnUrl: service.route }, { replace: true });

    // On mobile/tablet, smoothly scroll login card into view and focus email field
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      loginCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 150);
  };

  const handleClearSelectedService = () => {
    setSearchParams({}, { replace: true });
  };

  const handleSocialLogin = (provider: 'Google' | 'Microsoft') => {
    setSocialNotice(
      `Redirecting to ${provider} Single Sign-On. You can also log in directly using our verified credentials below.`
    );
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 selection:bg-emerald-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* ==================================================================== */}
      {/* 1. TOP NAVIGATION BAR                                                */}
      {/* ==================================================================== */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                Medicare
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 tracking-wide mt-1">
                Your Health, Our Priority
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 text-xs font-semibold text-slate-600 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap"
            >
              <Home className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Home</span>
            </Link>
            <Link
              to="/medicines"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap"
            >
              <Pill className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Medicines</span>
            </Link>
            <Link
              to="/doctors"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap"
            >
              <Stethoscope className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Doctors</span>
            </Link>
            <Link
              to="/health-checkups"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap"
            >
              <Heart className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span><span className="hidden xl:inline">Health </span>Checkups</span>
            </Link>
            <Link
              to="/facilities"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Facilities</span>
            </Link>
            <Link
              to="/premium"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 flex-shrink-0" />
              <span>Premium</span>
            </Link>
            <a
              href="/#about"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap"
            >
              <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>About</span>
            </a>
            <a
              href="/#contact"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors py-2 whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Contact</span>
            </a>
          </nav>

          {/* Right Header Action: Clean Sign Up Action Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-sm shadow-emerald-600/25 transition-all flex-shrink-0 whitespace-nowrap hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
              >
                <Home className="w-4 h-4 text-emerald-600" /> Home
              </Link>
              <Link
                to="/medicines"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
              >
                <Pill className="w-4 h-4 text-emerald-600" /> Medicines
              </Link>
              <Link
                to="/doctors"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
              >
                <Stethoscope className="w-4 h-4 text-emerald-600" /> Doctors
              </Link>
              <Link
                to="/health-checkups"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
              >
                <Heart className="w-4 h-4 text-emerald-600" /> Checkups
              </Link>
              <Link
                to="/facilities"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
              >
                <Building2 className="w-4 h-4 text-emerald-600" /> Facilities
              </Link>
              <Link
                to="/premium"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
              >
                <Star className="w-4 h-4 text-amber-500" /> Premium
              </Link>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN HERO BODY (Left Content, Doctor & Right Login Card)           */}
      {/* ==================================================================== */}
      <main className="flex-1 relative flex items-center py-6 sm:py-10 lg:py-12 overflow-hidden">
        {/* Soft Background Hospital & Cyan Tint Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/30 pointer-events-none" />

        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 left-10 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* Dynamic Curving Teal Graphic Wave at Lower Left */}
        <div className="absolute bottom-0 left-0 w-full max-w-[850px] h-[280px] sm:h-[340px] pointer-events-none select-none z-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 850 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            {/* Background Soft Emerald Wave */}
            <path
              d="M-50 340C120 280 260 210 440 230C620 250 680 180 820 140V340H-50Z"
              fill="#2dd4bf"
              fillOpacity="0.25"
            />
            {/* Medium Mint Teal Wave */}
            <path
              d="M-40 340C140 250 280 200 460 240C640 280 720 160 850 130V340H-40Z"
              fill="#0d9488"
              fillOpacity="0.5"
            />
            {/* Deep Rich Healthcare Teal Wave */}
            <path
              d="M-20 340C100 240 220 190 380 260C500 310 600 240 760 170V340H-20Z"
              fill="#045660"
            />
            {/* Decorative Pulse Line & Heart Outline */}
            <g stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.65">
              <path d="M 80 285 L 120 285 L 130 265 L 140 305 L 150 275 L 160 295 L 170 285 L 195 285" />
              <path
                d="M 215 285 C 215 280 210 274 204 274 C 198 274 195 279 195 285 C 195 293 205 301 215 307 C 225 301 235 293 235 285 C 235 279 232 274 226 274 C 220 274 215 280 215 285 Z"
                fill="none"
              />
              <path d="M 235 285 L 260 285 L 270 270 L 280 300 L 290 285 L 320 285" />
            </g>
          </svg>
        </div>

        {/* Main Content Container: Left Info, Center Doctor & Right Login Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 xl:gap-6 items-center">
            {/* ============================================================== */}
            {/* LEFT COLUMN: Hero Headlines, 4 Quick Features, Trust Badge      */}
            {/* ============================================================== */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-5 sm:space-y-7 max-w-xl mx-auto lg:mx-0 w-full">
              {/* Headline */}
              <div>
                <h1 className="text-3xl sm:text-4xl xl:text-[46px] font-black text-slate-900 tracking-tight leading-[1.12]">
                  Your Trusted <br />
                  <span className="text-emerald-600">Healthcare Partner</span>
                </h1>
                <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-lg">
                  Get medicines, book doctors, upload prescriptions and take care of your health — all
                  in one place.
                </p>
              </div>

              {/* 4 Responsive Auth-Aware Quick Healthcare Option Cards */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-0.5">
                  <span className={isAuthenticated ? 'text-emerald-700' : 'text-slate-500'}>
                    {isAuthenticated
                      ? 'Instant Service Access (Unlocked)'
                      : 'Choose a Service & Sign In'}
                  </span>
                  {!isAuthenticated && selectedService && (
                    <button
                      type="button"
                      onClick={handleClearSelectedService}
                      className="text-emerald-600 hover:text-emerald-700 font-bold normal-case tracking-normal underline"
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3">
                  {QUICK_HEALTH_SERVICES.map((service) => {
                    const ServiceIcon = service.icon;
                    const isSelected = !isAuthenticated && selectedService?.id === service.id;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => handleQuickServiceClick(service)}
                        aria-pressed={isSelected}
                        className={`relative rounded-2xl p-3 sm:p-3.5 border transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          isSelected
                            ? 'bg-emerald-50/95 border-emerald-500 ring-2 ring-emerald-500/25 shadow-md -translate-y-0.5'
                            : 'bg-white/95 backdrop-blur-md border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-500/80 hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Auth Status Corner Micro-Indicator */}
                        <span
                          className={`absolute top-2 right-2 transition-opacity ${
                            isAuthenticated
                              ? 'opacity-100'
                              : isSelected
                                ? 'opacity-100 text-emerald-600'
                                : 'opacity-35 group-hover:opacity-100 text-slate-400 group-hover:text-emerald-600'
                          }`}
                          title={
                            isAuthenticated
                              ? `Open ${service.fullLabel}`
                              : `Sign in to open ${service.fullLabel}`
                          }
                        >
                          {isAuthenticated ? (
                            <span className="block w-2 h-2 rounded-full bg-emerald-500" />
                          ) : isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                        </span>

                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                          }`}
                        >
                          <ServiceIcon className="w-5 h-5" />
                        </div>

                        <span className="text-xs font-bold text-slate-800 leading-tight">
                          {service.titleLine1} <br className="hidden sm:block" /> {service.titleLine2}
                        </span>

                        <span
                          className={`text-[10px] font-semibold leading-none transition-colors ${
                            isAuthenticated
                              ? 'text-emerald-600 opacity-85 group-hover:opacity-100'
                              : isSelected
                                ? 'text-emerald-700 font-bold'
                                : 'text-slate-400 group-hover:text-emerald-600'
                          }`}
                        >
                          {isAuthenticated ? 'Open →' : isSelected ? 'Sign in →' : 'Login required'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Safe & Secure Trust Card */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm max-w-md flex items-center gap-3.5 hover:shadow transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Safe & Secure
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your data is protected with enterprise-grade security.
                  </p>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* CENTER COLUMN: Dedicated Non-Overlapping Doctor Illustration   */}
            {/* ============================================================== */}
            <div className="hidden lg:flex lg:col-span-2 xl:col-span-3 items-end justify-center self-end pointer-events-none select-none z-10 -mb-6 sm:-mb-10 lg:-mb-12">
              <img
                src="/images/doctor-hero.png"
                alt="Friendly Professional Medicare Doctor"
                className="w-full max-w-[230px] xl:max-w-[330px] h-auto object-contain object-bottom drop-shadow-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* ============================================================== */}
            {/* RIGHT COLUMN: The Login Card                                   */}
            {/* ============================================================== */}
            <div
              ref={loginCardRef}
              className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-2xl shadow-slate-300/40 border border-slate-100 p-6 sm:p-8 relative z-20">
                {/* Card Header Brand Logo */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-wider">
                      MEDICARE
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">
                    Welcome Back!
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-500 mt-1">
                    {isAuthenticated && user
                      ? `Signed in as ${user.fullName}`
                      : 'Sign in to access your healthcare dashboard'}
                  </p>
                </div>

                {/* Active Logged-In Session Shortcut */}
                {isAuthenticated && user && (
                  <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2.5 text-xs text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">Active Session: {user.email}</p>
                        <p className="text-[11px] text-emerald-700">
                          Click any healthcare card on the left or jump straight to your portal.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            returnUrl !== '/user/dashboard'
                              ? returnUrl
                              : getDefaultDashboardRoute(user.role)
                          )
                        }
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <span>
                          {selectedService ? `Open ${selectedService.titleLine2}` : 'Open Portal'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={logout}
                        className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-emerald-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-slate-500" />
                        <span>Switch User</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Contextual Selected Service Redirect Notice */}
                {!isAuthenticated && (selectedService || returnUrl !== '/user/dashboard') && (
                  <div className="mt-4 p-3 bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center justify-between gap-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">
                          {selectedService
                            ? `Sign in to open ${selectedService.fullLabel}`
                            : 'Sign in required to continue'}
                        </p>
                        <p className="text-[10px] text-emerald-700 truncate">
                          You will be redirected automatically after login
                        </p>
                      </div>
                    </div>
                    {selectedService && (
                      <button
                        type="button"
                        onClick={handleClearSelectedService}
                        className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition flex-shrink-0"
                        aria-label="Clear selected service"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Feedback Alerts */}
                {error && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                {socialNotice && (
                  <div className="mt-4 p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                    <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{socialNotice}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  {/* Email Address Field */}
                  <div>
                    <label
                      htmlFor="login-email-input"
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-600" />
                      <span>Email Address</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        ref={emailInputRef}
                        id="login-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-3.5 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="login-password-input"
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                      <span>Password</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-10 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Options: Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-800">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 transition-colors"
                      />
                      <span>Remember Me</span>
                    </label>

                    <Link
                      to="/forgot-password"
                      className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* Primary Login Button */}
                  <button
                    id="login-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        Login
                      </span>
                    )}
                  </button>
                </form>

                {/* OR Divider */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="border-t border-slate-200/90 w-full" />
                  <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    OR
                  </span>
                  <div className="border-t border-slate-200/90 w-full" />
                </div>

                {/* Social Logins: Google & Microsoft */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Google')}
                    className="py-2.5 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition shadow-sm group"
                  >
                    {/* Official Google 4-Color G Icon */}
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="truncate">Continue with Google</span>
                  </button>

                  {/* Continue with Microsoft */}
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('Microsoft')}
                    className="py-2.5 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition shadow-sm group"
                  >
                    {/* Official Microsoft 4-Color Square Icon */}
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                    </svg>
                    <span className="truncate">Continue with Microsoft</span>
                  </button>
                </div>

                {/* Don't have an account? Sign Up Banner - Positioned Directly Under Login Options */}
                <div className="mt-5 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50/60 border border-emerald-200/80 flex items-center justify-between gap-2 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 truncate">
                      Don't have an account?
                    </span>
                  </div>
                  <Link
                    to={
                      returnUrl !== '/user/dashboard'
                        ? `/register?returnUrl=${encodeURIComponent(returnUrl)}`
                        : '/register'
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-sm shadow-emerald-600/20 flex items-center gap-1 flex-shrink-0 transition-transform active:scale-95 whitespace-nowrap"
                  >
                    Sign Up <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Developer / Demo Quick Access Pill */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowDemoLogins(!showDemoLogins)}
                    className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-wider"
                  >
                    <span>Quick Demo Credentials</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      {showDemoLogins ? 'Hide' : 'Auto-Fill'}
                    </span>
                  </button>

                  {showDemoLogins && (
                    <div className="grid grid-cols-2 gap-1.5 mt-2.5 animate-in fade-in duration-150">
                      <button
                        type="button"
                        onClick={() => handleDemoFill('kayaroy345@gmail.com', 'Admin123!')}
                        className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition flex flex-col"
                      >
                        <span className="text-[11px] font-bold text-slate-800">👑 Admin</span>
                        <span className="text-[9px] text-slate-500 truncate">kayaroy345@gmail.com</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDemoFill('doctor@medicare.demo', 'Admin123!')}
                        className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition flex flex-col"
                      >
                        <span className="text-[11px] font-bold text-slate-800">🩺 Doctor</span>
                        <span className="text-[9px] text-slate-500 truncate">doctor@medicare.demo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDemoFill('pharmacist@medicare.demo', 'Admin123!')}
                        className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition flex flex-col"
                      >
                        <span className="text-[11px] font-bold text-slate-800">💊 Pharmacist</span>
                        <span className="text-[9px] text-slate-500 truncate">pharmacist@medicare.demo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDemoFill('patient@medicare.demo', 'Admin123!')}
                        className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition flex flex-col"
                      >
                        <span className="text-[11px] font-bold text-slate-800">👤 Patient</span>
                        <span className="text-[9px] text-slate-500 truncate">patient@medicare.demo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Watermark Cross in Lower Right Corner */}
        <div className="absolute -bottom-8 right-3 text-emerald-300/30 pointer-events-none select-none z-10">
          <Plus className="w-24 h-24 stroke-[4]" />
        </div>
      </main>

      {/* ==================================================================== */}
      {/* 3. BOTTOM TRUST & METRICS BAR                                        */}
      {/* ==================================================================== */}
      <footer className="w-full bg-[#e9f9f6] border-t border-emerald-100/80 py-3.5 px-4 sm:px-8 relative z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-y-2 gap-x-4 text-xs font-semibold text-slate-700">
          {/* Metric 1: Trusted by 1M+ Users */}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Trusted by 1M+ Users</span>
          </div>

          <div className="hidden md:block h-3.5 w-px bg-emerald-200/80" />

          {/* Metric 2: 24/7 Support */}
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>24/7 Support</span>
          </div>

          <div className="hidden md:block h-3.5 w-px bg-emerald-200/80" />

          {/* Metric 3: Rated 4.8/5 */}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-emerald-600 fill-emerald-600 flex-shrink-0" />
            <span>Rated 4.8/5</span>
          </div>

          <div className="hidden md:block h-3.5 w-px bg-emerald-200/80" />

          {/* Metric 4: Better Health. Happier Life. */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600/30 flex-shrink-0" />
            <span>Better Health. Happier Life.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
