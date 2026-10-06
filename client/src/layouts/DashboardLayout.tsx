import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Calendar,
  Activity,
  Crown,
  MapPin,
  User as UserIcon,
  LogOut,
  Bell,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CartDrawer } from '../components/common/CartDrawer';
import { useAuthStore } from '../store/authStore';
import { ScrollProgressBar, ScrollToTopButton } from '../components/scroll';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', href: '/user/dashboard', icon: LayoutDashboard },
    { label: 'My Orders', href: '/user/orders', icon: ShoppingBag },
    { label: 'Prescriptions', href: '/user/prescriptions', icon: FileText },
    { label: 'Appointments', href: '/user/appointments', icon: Calendar },
    { label: 'Health Checkups', href: '/user/health-checkups', icon: Activity },
    { label: 'VIP Membership', href: '/user/membership', icon: Crown, highlight: true },
    { label: 'Saved Addresses', href: '/user/addresses', icon: MapPin },
    { label: 'Notifications', href: '/user/notifications', icon: Bell },
    { label: 'Profile & Settings', href: '/user/profile', icon: UserIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative">
      <ScrollProgressBar height={3.5} showPercentagePill={true} />
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-6">
            {/* User Profile Card */}
            <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</h3>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === '/user/dashboard'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                          : item.highlight
                          ? 'text-amber-700 hover:bg-amber-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition mt-4 pt-4 border-t border-slate-100 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Workspace Area */}
          <main className="lg:col-span-3 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <CartDrawer />
      <Footer />
      <ScrollToTopButton visibilityThreshold={240} />
    </div>
  );
};
