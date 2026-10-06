import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  ShoppingBag,
  FileCheck,
  Calendar,
  Stethoscope,
  Users,
  ShieldAlert,
  Building2,
  Package,
  Crown,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Analytics Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Medicines Inventory', href: '/admin/medicines', icon: Pill },
    { label: 'Orders & Fulfillment', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Prescriptions Review', href: '/pharmacist', icon: FileCheck },
    { label: 'Appointments Oversight', href: '/admin/appointments', icon: Calendar },
    { label: 'Physicians Directory', href: '/admin/doctors', icon: Stethoscope },
    { label: 'User Directory', href: '/admin/users', icon: Users },
    { label: 'Checkup Packages', href: '/admin/packages', icon: Package },
    { label: 'Premium VIP Checkups', href: '/admin/premium-checkups', icon: Crown },
    { label: 'Healthcare Facilities', href: '/admin/facilities', icon: Building2 },
    { label: 'Security Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 relative">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Responsive Slide-over Drawer on Mobile / Persistent on Desktop) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-64 lg:flex ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand & Mobile Close Button */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-sm">
                M
              </div>
              <span className="font-extrabold tracking-tight text-white text-base">
                MEDICARE <span className="text-emerald-400 text-xs">ADMIN</span>
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
              aria-label="Close Admin Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Public Site</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Identity */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-500 text-purple-300 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Administrator'}</p>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase">Super Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-y-auto">
        <header className="h-16 border-b border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Toggle Button for Mobile/Tablet */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition flex-shrink-0"
              aria-label="Toggle Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center font-black text-white text-[10px]">
                M
              </div>
              <span className="font-extrabold text-white text-xs truncate">MEDICARE</span>
            </div>

            <h1 className="hidden sm:block text-xs sm:text-sm font-bold text-slate-200 truncate">
              Medicare Healthcare Administration Control Tower
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="hidden xs:inline">Database Status: Atlas Active</span>
            <span className="xs:hidden font-mono text-[11px] text-emerald-400">Atlas Live</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
