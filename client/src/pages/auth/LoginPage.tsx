import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HeartPulse, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/user/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post<{ token: string; user: any }>('/auth/login', {
        email,
        password,
      });

      setAuth(res.user, res.token);

      // Route based on role if no specific returnUrl provided
      if (returnUrl === '/user/dashboard') {
        if (res.user.role === 'ADMIN') navigate('/admin');
        else if (res.user.role === 'PHARMACIST') navigate('/pharmacist');
        else if (res.user.role === 'DOCTOR') navigate('/doctor');
        else navigate('/user/dashboard');
      } else {
        navigate(returnUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
            <HeartPulse className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            MEDI<span className="text-emerald-600">CARE</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Welcome to Your Healthcare Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sign in to manage medications, appointments, prescriptions, and lab reports.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-3xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Box */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Quick Demo Credentials
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Click to Auto-Fill
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('kayaroy345@gmail.com');
                  setPassword('Admin123!');
                }}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  email === 'kayaroy345@gmail.com'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    👑 System Admin
                  </span>
                  <span className="text-[9px] font-mono bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded">
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  kayaroy345@gmail.com
                </span>
                <span className="text-[9px] text-slate-400">PW: Admin123!</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('doctor@medicare.demo');
                  setPassword('Admin123!');
                }}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  email === 'doctor@medicare.demo'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    🩺 Doctor
                  </span>
                  <span className="text-[9px] font-mono bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                    DOCTOR
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  doctor@medicare.demo
                </span>
                <span className="text-[9px] text-slate-400">PW: Admin123!</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('pharmacist@medicare.demo');
                  setPassword('Admin123!');
                }}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  email === 'pharmacist@medicare.demo'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    💊 Pharmacist
                  </span>
                  <span className="text-[9px] font-mono bg-teal-100 text-teal-700 font-bold px-1.5 py-0.2 rounded">
                    PHARMACIST
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  pharmacist@medicare.demo
                </span>
                <span className="text-[9px] text-slate-400">PW: Admin123!</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('patient@medicare.demo');
                  setPassword('Admin123!');
                }}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                  email === 'patient@medicare.demo'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    👤 Patient / User
                  </span>
                  <span className="text-[9px] font-mono bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                    USER
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  patient@medicare.demo
                </span>
                <span className="text-[9px] text-slate-400">PW: Admin123!</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-emerald-600 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
