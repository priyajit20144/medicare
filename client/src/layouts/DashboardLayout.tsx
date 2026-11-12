import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  ChevronDown,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CartDrawer } from '../components/common/CartDrawer';
import { useAuthStore } from '../store/authStore';
import { ScrollProgressBar, ScrollToTopButton } from '../components/scroll';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

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

  const activeNav = navItems.find(
    (item) =>
      location.pathname === item.href ||
      (item.href !== '/user/dashboard' && location.pathname.startsWith(item.href))
  ) || navItems[0];

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-clip bg-slate-50 relative">
      <ScrollProgressBar height={3.5} showPercentagePill={true} />
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
          {/* Sidebar (Collapsible Portal Drawer on Mobile/Tablet, Persistent on Desktop) */}
          <aside className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm lg:space-y-6 lg:sticky lg:top-24">
            {/* User Profile Card + Mobile Accordion Toggle */}
            <div className="flex items-center justify-between gap-3 lg:pb-5 lg:border-b lg:border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm flex-shrink-0">
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

              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                aria-expanded={mobileNavOpen}
                aria-label="Toggle patient portal navigation"
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex-shrink-0 transition"
              >
                <span className="max-w-[96px] truncate">{activeNav.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    mobileNavOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Navigation */}
            <nav className={`${mobileNavOpen ? 'block mt-4 pt-4 border-t border-slate-100' : 'hidden'} lg:block space-y-1`}>
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
