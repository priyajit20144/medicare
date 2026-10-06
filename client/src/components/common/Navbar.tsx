import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Bell,
  User as UserIcon,
  ChevronDown,
  ChevronRight,
  Home,
  Pill,
  Stethoscope,
  Activity,
  Building2,
  Crown,
  Info,
  Mail,
  LogOut,
  Menu,
  X,
  FileText,
  Calendar,
  Package,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { api } from '../../api/client';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { summary, setIsOpen } = useCartStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(3);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileMenuOpen]);

  // Click outside listener for user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard accessibility: Escape key closes all popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch unread notifications
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications')
        .then((res) => {
          if (res && res.unreadCount !== undefined) {
            setUnreadCount(res.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  // Nav Dropdown Options matching the screenshot
  const medicinesDropdown = [
    { label: 'All Medicines', href: '/medicines', desc: 'Browse complete certified pharmaceutical catalog' },
    { label: 'Prescription Medicines', href: '/medicines?category=prescription', desc: 'Verified by board pharmacists' },
    { label: 'Over-the-Counter (OTC)', href: '/medicines?category=otc', desc: 'Daily essentials & pain relief' },
    { label: 'Vitamins & Supplements', href: '/medicines?category=vitamins', desc: 'Immunity, sleep & wellness' },
  ];

  const doctorsDropdown = [
    { label: 'All Specialists', href: '/doctors', desc: 'Book verified clinical specialists' },
    { label: 'Cardiology', href: '/doctors?specialization=Cardiology', desc: 'Heart care & cardiovascular health' },
    { label: 'Dermatology', href: '/doctors?specialization=Dermatology', desc: 'Skin, hair & clinical dermatology' },
    { label: 'Pediatrics', href: '/doctors?specialization=Pediatrics', desc: 'Child health, milestones & care' },
    { label: 'Psychiatry', href: '/doctors?specialization=Psychiatry', desc: 'Mental health & therapy management' },
  ];

  const checkupsDropdown = [
    { label: 'All Health Checkups', href: '/health-checkups', desc: 'Comprehensive preventative panels' },
    { label: 'Executive Health Checkup', href: '/health-checkups', desc: '24 clinical biomarkers with home collection' },
    { label: 'Cardiac Wellness Screening', href: '/health-checkups', desc: 'Cardiovascular lipid risk evaluation' },
    { label: 'Diabetes Care Panel', href: '/health-checkups', desc: 'Complete metabolic & glycemic review' },
  ];

  const facilitiesDropdown = [
    { label: 'All Healthcare Facilities', href: '/facilities', desc: 'Certified partner hubs across your city' },
    { label: 'Diagnostic Centers', href: '/facilities', desc: 'High-precision pathology & imaging' },
    { label: 'Partner Clinics', href: '/facilities', desc: 'In-person outpatient doctor consultations' },
    { label: 'Sample Collection Centers', href: '/facilities', desc: 'Safe temperature-controlled labs' },
  ];

  // Navigation Links matching clean professional healthcare hierarchy
  const navItems = [
    { key: 'home', label: 'Home', href: '/', icon: Home, exact: true },
    { key: 'medicines', label: 'Medicines', href: '/medicines', icon: Pill, hasDropdown: true, items: medicinesDropdown },
    { key: 'doctors', label: 'Doctors', href: '/doctors', icon: Stethoscope, hasDropdown: true, items: doctorsDropdown },
    { key: 'checkups', label: 'Health Checkups', href: '/health-checkups', icon: Activity, hasDropdown: true, items: checkupsDropdown },
    { key: 'facilities', label: 'Facilities', href: '/facilities', icon: Building2, hasDropdown: true, items: facilitiesDropdown },
    { key: 'premium', label: 'Premium', href: '/premium', icon: Crown },
    { key: 'about', label: 'About', href: '/#about', icon: Info },
    { key: 'contact', label: 'Contact', href: '/#contact', icon: Mail },
  ];

  const isNavActive = (href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  const displayName = user?.fullName || 'John Doe';
  const displayRole = user?.role ? (user.role.charAt(0) + user.role.slice(1).toLowerCase()) : 'User';
  const displayEmail = user?.email || 'john@example.com';

  return (
    <header className="w-full bg-white text-slate-800 border-b border-slate-200/90 shadow-sm z-40 sticky top-0 font-sans select-none">
      
      {/* MAIN HEADER (Logo, Search Bar, Quick Actions & User Profile) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          
          {/* Brand Logo (Matches user screenshot: Heart with ECG line + "Medicare" + "Your Health, Our Priority") */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none flex-shrink-0">
            {/* Custom SVG Heart with ECG Line */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#0d766e] to-[#0d9488] flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 44 44" fill="none">
                <path
                  d="M22 39L19.5 36.7C10.2 28.2 4 22.6 4 15.6C4 9.8 8.5 5.3 14.3 5.3C17.5 5.3 20.6 6.8 22 9.1C23.4 6.8 26.5 5.3 29.7 5.3C35.5 5.3 40 9.8 40 15.6C40 22.6 33.8 28.2 24.5 36.7L22 39Z"
                  fill="white"
                  fillOpacity="0.25"
                />
                <path
                  d="M6 22H14.5L17.5 14L22 30L25.5 17L28 24H38"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0f2d42] leading-tight font-sans">
                Medicare
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-normal">
                Your Health, Our Priority
              </span>
            </div>
          </Link>

          {/* Central Search Bar (Pill-shaped with inner teal button) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-4">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center bg-[#f8fafc] border border-slate-200 rounded-full p-1 pl-4 shadow-inner focus-within:bg-white focus-within:border-[#0d9488] focus-within:ring-2 focus-within:ring-teal-500/15 transition-all"
            >
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines, doctors, health checkups, facilities..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-normal"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs sm:text-sm rounded-full transition shadow-sm flex-shrink-0 ml-1"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-4 lg:gap-5 flex-shrink-0">
            
            {/* Upload Prescription */}
            <Link
              to="/prescriptions/upload"
              id="navbar-upload-prescription-btn"
              className="hidden lg:flex flex-col items-center group text-slate-600 hover:text-[#0d9488] transition text-center px-1"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-slate-50 transition">
                <FileText className="w-5 h-5 text-slate-700 group-hover:text-[#0d9488]" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600 group-hover:text-[#0d9488] whitespace-nowrap -mt-0.5">
                Upload<br />Prescription
              </span>
            </Link>

            {/* Book Appointment */}
            <Link
              to="/doctors"
              id="navbar-book-appointment-btn"
              className="hidden lg:flex flex-col items-center group text-slate-600 hover:text-[#0d9488] transition text-center px-1"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-slate-50 transition">
                <Calendar className="w-5 h-5 text-slate-700 group-hover:text-[#0d9488]" />
              </div>
              <span className="text-[10px] font-semibold text-slate-600 group-hover:text-[#0d9488] whitespace-nowrap -mt-0.5">
                Book<br />Appointment
              </span>
            </Link>

            {/* Notifications Bell */}
            <Link
              to={isAuthenticated ? '/user/notifications' : '/login'}
              id="navbar-notifications-btn"
              className="relative p-2 text-slate-600 hover:text-[#0d9488] hover:bg-slate-50 rounded-full transition flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-700 hover:text-[#0d9488]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#ef4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Cart with Badge Counter */}
            <button
              type="button"
              id="navbar-cart-btn"
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center group text-slate-600 hover:text-[#0d9488] transition text-center px-1 relative min-h-[40px] justify-center"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 group-hover:text-[#0d9488]" />
                {summary.itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-[#0d9488] text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                    {summary.itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-[11px] font-semibold text-slate-600 group-hover:text-[#0d9488] mt-0.5">
                Cart
              </span>
            </button>

            {/* User Profile Pill & Dropdown (Matches user screenshot) */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                id="navbar-user-profile-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-full sm:rounded-xl hover:bg-slate-100 transition text-left"
              >
                {/* User Avatar Circle */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#dbeafe] text-[#1e40af] flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-[#2563eb]" />
                </div>

                <div className="hidden sm:flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {displayName}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium leading-none">
                    {displayRole}
                  </span>
                </div>
              </button>

              {/* Exact User Dropdown Menu from the Screenshot */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-50 text-slate-700"
                  >
                    {/* Header with avatar, name, email */}
                    <div className="flex items-center gap-3 px-4 pb-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-bold">
                        <UserIcon className="w-5 h-5 text-[#0284c7]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {displayName}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                          {displayEmail}
                        </p>
                      </div>
                    </div>

                    {/* Menu Items with right chevrons */}
                    <div className="py-2 text-xs font-semibold space-y-0.5">
                      <Link
                        to="/user/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-slate-700 group transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Home className="w-4 h-4 text-slate-400 group-hover:text-[#0d9488]" />
                          <span>Dashboard</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      <Link
                        to="/user/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-slate-700 group transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-slate-400 group-hover:text-[#0d9488]" />
                          <span>My Orders</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      <Link
                        to="/user/prescriptions"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-slate-700 group transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#0d9488]" />
                          <span>My Prescriptions</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      <Link
                        to="/user/appointments"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-slate-700 group transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-slate-400 group-hover:text-[#0d9488]" />
                          <span>My Appointments</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      <Link
                        to="/user/membership"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 text-slate-700 group transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Crown className="w-4 h-4 text-amber-500" />
                          <span>Membership</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </Link>

                      {/* Role Portals if Authenticated with specific role */}
                      {user?.role === 'PHARMACIST' && (
                        <Link
                          to="/pharmacist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2 hover:bg-emerald-50 text-emerald-800 font-bold"
                        >
                          <div className="flex items-center gap-2.5">
                            <Pill className="w-4 h-4 text-emerald-600" />
                            <span>Pharmacist Portal</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {user?.role === 'DOCTOR' && (
                        <Link
                          to="/doctor"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2 hover:bg-blue-50 text-blue-800 font-bold"
                        >
                          <div className="flex items-center gap-2.5">
                            <Stethoscope className="w-4 h-4 text-blue-600" />
                            <span>Doctor Portal</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2 hover:bg-purple-50 text-purple-800 font-bold"
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                            <span>Admin Portal</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>

                    {/* Bottom Settings & Logout */}
                    <div className="pt-2 border-t border-slate-100 text-xs font-semibold space-y-0.5">
                      <Link
                        to="/user/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 text-slate-700"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Profile & Settings</span>
                      </Link>

                      {isAuthenticated ? (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Logout</span>
                        </button>
                      ) : (
                        <Link
                          to="/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-[#0d9488] hover:bg-teal-50"
                        >
                          <UserIcon className="w-4 h-4 text-[#0d9488]" />
                          <span>Sign In / Register</span>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Only visible on small devices) */}
        <div className="mt-2.5 md:hidden">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full flex items-center bg-[#f8fafc] border border-slate-200 rounded-full p-1 pl-3.5 focus-within:bg-white focus-within:border-[#0d9488]"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines, doctors, tests..."
              className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#0d9488] text-white font-bold text-xs rounded-full"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* BOTTOM NAVIGATION BAR (Exact items & layout from user screenshot) */}
      <nav className="hidden lg:block border-t border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 xl:gap-8 h-12">
            {navItems.map((item) => {
              const active = isNavActive(item.href, item.exact);
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="relative group h-full flex items-center"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.key)}
                  onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
                >
                  <Link
                    to={item.href}
                    className={`flex items-center gap-1.5 text-xs xl:text-sm font-semibold transition-colors duration-150 h-full relative ${
                      active
                        ? 'text-[#0d9488] font-bold'
                        : 'text-slate-700 hover:text-[#0d9488]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#0d9488]' : 'text-slate-500 group-hover:text-[#0d9488]'}`} />
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0d9488] transition-transform duration-200 group-hover:rotate-180" />
                    )}

                    {/* Active Bottom Underline (Matches user screenshot under Home tab) */}
                    {active && (
                      <motion.div
                        layoutId="nav-bottom-line"
                        className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0d9488] rounded-t-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>

                  {/* Dropdown Menu on Hover */}
                  {item.hasDropdown && item.items && (
                    <div
                      className={`absolute top-full left-0 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 transition-all duration-200 ${
                        activeDropdown === item.key ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible pointer-events-none translate-y-1'
                      }`}
                    >
                      {item.items.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.href}
                          className="block px-4 py-2 hover:bg-slate-50 transition group/item"
                        >
                          <div className="text-xs font-bold text-slate-800 group-hover/item:text-[#0d9488]">
                            {sub.label}
                          </div>
                          {sub.desc && (
                            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {sub.desc}
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MOBILE SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-[82vw] max-w-sm bg-white z-50 shadow-2xl flex flex-col justify-between overflow-y-auto lg:hidden"
            >
              <div>
                {/* Drawer Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0d9488] flex items-center justify-center text-white">
                      <HeartPulse className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-black text-slate-900">Medicare</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-2 p-3 border-b border-slate-100 bg-white">
                  <Link
                    to="/prescriptions/upload"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-teal-50 text-[#0d9488] text-xs font-bold border border-teal-100 text-center"
                  >
                    <FileText className="w-4 h-4 mb-1" />
                    <span>Upload Rx</span>
                  </Link>

                  <Link
                    to="/doctors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 text-center"
                  >
                    <Calendar className="w-4 h-4 mb-1" />
                    <span>Book Doctor</span>
                  </Link>
                </div>

                {/* Navigation Links Accordion */}
                <div className="p-3 space-y-1">
                  {navItems.map((item) => {
                    const active = isNavActive(item.href, item.exact);
                    const Icon = item.icon;

                    return (
                      <div key={item.key}>
                        <Link
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                            active
                              ? 'bg-teal-50 text-[#0d9488]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${active ? 'text-[#0d9488]' : 'text-slate-500'}`} />
                            <span>{item.label}</span>
                          </div>
                          {item.hasDropdown && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Footer with User & Contact */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{displayEmail}</p>
                  </div>
                </div>

                <a
                  href="tel:+15551234567"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  <Bell className="w-3.5 h-3.5 text-[#0d9488]" />
                  <span>24/7 Clinical Support</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};
