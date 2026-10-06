import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Clock,
  MessageSquare,
  TrendingUp,
  User,
  Settings,
  Search,
  Bell,
  HeartPulse,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Stethoscope,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Home,
} from 'lucide-react';
import { DoctorPortalProvider, useDoctorPortal } from '../context/DoctorPortalContext';
import { useAuthStore } from '../store/authStore';

export const getValidDoctorAvatar = (url?: string | null): string => {
  const DEFAULT_AVATAR =
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
  if (!url || typeof url !== 'string') return DEFAULT_AVATAR;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    (trimmed.startsWith('/') && !trimmed.includes(' '))
  ) {
    return trimmed;
  }
  return DEFAULT_AVATAR;
};

const DoctorLayoutInner: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    doctorStatus,
    setDoctorStatus,
    activeSidebarTab,
    setActiveSidebarTab,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    notifications,
    unreadNotificationsCount,
    unreadMessagesCount,
    markNotificationAsRead,
    clearAllNotifications,
    openMessages,
    openAvailability,
  } = useDoctorPortal();

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

  const doctorName = user?.fullName || 'Dr. Sophia Reyes';
  const doctorSpecialty = (user as any)?.specialization || 'Cardiologist';
  const doctorAvatar = getValidDoctorAvatar((user as any)?.avatar);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'appointments', label: 'Appointments', icon: Calendar, badge: null },
    { id: 'patients', label: 'Patients', icon: Users, badge: null },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText, badge: null },
    { id: 'availability', label: 'Availability', icon: Clock, badge: null },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'reports', label: 'Earnings / Reports', icon: TrendingUp, badge: null },
    { id: 'profile', label: 'Profile', icon: User, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  // Sync activeSidebarTab with route pathname
  useEffect(() => {
    const raw = location.pathname.replace(/^\/doctor\/?/, '').split('/')[0];
    const currentTab = raw || 'dashboard';
    if (navItems.some((item) => item.id === currentTab)) {
      setActiveSidebarTab(currentTab);
    }
  }, [location.pathname, setActiveSidebarTab]);

  const handleNavClick = (id: string) => {
    setActiveSidebarTab(id);
    setMobileSidebarOpen(false);
    if (id === 'dashboard') {
      navigate('/doctor');
    } else {
      navigate(`/doctor/${id}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen w-full bg-[#f4f7f9] text-slate-900 overflow-hidden font-sans">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (DESKTOP)                                 */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-64 xl:w-72 bg-[#0c2427] text-white flex-col justify-between flex-shrink-0 z-30 select-none shadow-xl border-r border-[#081a1c]">
        {/* Top Logo & Navigation list */}
        <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar pt-6 px-4">
          {/* Medicare Logo & Subtitle */}
          <Link
            to="/doctor"
            className="flex items-center gap-3 px-2 mb-8 group"
            title="Medicare Physician Consultation Portal"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-xl font-black text-white tracking-tight leading-none block">
                Medicare
              </span>
              <span className="text-[11px] text-teal-300/80 font-medium tracking-wide mt-1 block">
                Your Health, Our Priority
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-[#0d9488] text-white shadow-lg shadow-teal-900/50'
                      : 'text-teal-100/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-teal-300/70'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && item.badge > 0 && (
                    <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-black text-[11px] flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Medical Graphic & Quick Links */}
        <div className="p-4 border-t border-teal-900/40 relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-teal-500/10 blur-xl pointer-events-none" />

          {/* Graphic Illustration */}
          <div className="flex items-center gap-3 mb-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white tracking-wide leading-tight">
                Better Care
              </p>
              <p className="text-[11px] text-teal-300/80 font-medium">
                Healthier Lives
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <Link
              to="/"
              className="text-teal-300/70 hover:text-white flex items-center gap-1 font-semibold transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Portal</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MOBILE DRAWER SIDEBAR                                  */}
      {/* ========================================================= */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-[#0c2427] text-white flex flex-col justify-between z-50 lg:hidden p-5 shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-teal-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center">
                      <HeartPulse className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-white">Medicare</span>
                      <span className="text-[10px] text-teal-300/80 block">Physician Portal</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-2 text-teal-300 hover:text-white rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5 mt-5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSidebarTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold text-left ${
                          isActive
                            ? 'bg-[#0d9488] text-white shadow-md'
                            : 'text-teal-100/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== null && item.badge > 0 && (
                          <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-black text-[11px] flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-teal-900/40 space-y-2">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-xs text-teal-300 hover:text-white font-semibold py-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Main Website</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 font-semibold py-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Portal</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 3. MAIN WORKSPACE CONTAINER (HEADER + CONTENT)            */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-[72px] bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 z-20 flex-shrink-0">
          {/* Left: Mobile Menu Toggle & Global Clinical Search */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Open clinical navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar matching Image 2 */}
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients, appointments, or medical records..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Quick Controls, Notification Bell, Message Bubble, Online Status, Doctor Profile */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Notification Bell with Badge */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-sm animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              <AnimatePresence>
                {notificationDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 text-xs overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">Notifications</span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold">
                          {unreadNotificationsCount} New
                        </span>
                      </div>
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] font-bold text-teal-600 hover:text-teal-800"
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                            n.unread ? 'bg-teal-50/40' : ''
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                              n.type === 'message'
                                ? 'bg-blue-500'
                                : n.type === 'prescription'
                                ? 'bg-rose-500'
                                : n.type === 'reminder'
                                ? 'bg-teal-500'
                                : 'bg-emerald-500'
                            }`}
                          >
                            {n.type === 'message' ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : n.type === 'prescription' ? (
                              <FileText className="w-4 h-4" />
                            ) : n.type === 'reminder' ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <ShieldCheck className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 leading-tight truncate">
                              {n.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                              {n.subtitle}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {n.time}
                            </span>
                          </div>
                          {n.unread && (
                            <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Message Bubble with Badge */}
            <button
              type="button"
              onClick={openMessages}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-teal-700 hover:bg-slate-100 transition"
              title="Patient & Staff Messages"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-sm">
                {unreadMessagesCount}
              </span>
            </button>

            {/* Online Status Pill matching Image 2 */}
            <div className="relative" ref={statusRef}>
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition"
                title="Change active clinical availability"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{doctorStatus}</span>
                <ChevronDown className="w-3 h-3 text-emerald-600 ml-0.5" />
              </button>

              <AnimatePresence>
                {statusDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs"
                  >
                    <button
                      onClick={() => {
                        setDoctorStatus('Online');
                        setStatusDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 font-semibold text-emerald-700"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Online (Available)</span>
                    </button>
                    <button
                      onClick={() => {
                        setDoctorStatus('In Consultation');
                        setStatusDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 font-semibold text-amber-700"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>In Consultation</span>
                    </button>
                    <button
                      onClick={() => {
                        setDoctorStatus('Away');
                        setStatusDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 font-semibold text-slate-600"
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Away (On Break)</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Doctor Profile Header matching Image 2 */}
            <div className="relative pl-1 sm:pl-2" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-slate-100 transition group text-left"
              >
                <img
                  src={doctorAvatar}
                  alt={doctorName}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-teal-500/40 shadow-sm flex-shrink-0"
                />
                <div className="hidden md:block min-w-0 pr-1">
                  <h3 className="text-xs font-extrabold text-slate-800 leading-tight truncate">
                    {doctorName}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate">
                    {doctorSpecialty}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{doctorName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email || 'dr.reyes@medicare.demo'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveSidebarTab('profile');
                        navigate('/doctor/profile');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Doctor Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSidebarTab('availability');
                        navigate('/doctor/availability');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Consultation Hours</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left hover:bg-rose-50 font-semibold text-rose-600 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out of Portal</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Clinical Stream Viewport */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-[#f4f7f9] p-4 sm:p-6 lg:p-7 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const DoctorLayout: React.FC = () => {
  return (
    <DoctorPortalProvider>
      <DoctorLayoutInner />
    </DoctorPortalProvider>
  );
};
