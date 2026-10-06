import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingState } from '../components/common/LoadingState';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Verifying authentication credentials..." minHeight="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export const RoleProtectedRoute: React.FC<{
  roles: UserRole[];
  children: React.ReactNode;
}> = ({ roles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingState message="Checking security permissions..." minHeight="min-h-screen" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Security Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          Your account role (<span className="font-semibold text-slate-700">{user.role}</span>) does not have authorization to view this medical administrative console.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
          <Link
            to="/user/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition"
          >
            Go to Patient Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
