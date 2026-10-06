import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  AlertCircle,
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Building2,
  Check,
  RefreshCw,
  Plus,
  Send,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Maximize2,
  ShieldCheck,
  Activity,
  Award,
  Sparkles,
  ArrowRight,
  X,
  FileCheck,
  UserCheck,
  CheckCircle,
  Play,
  Heart,
  Zap,
} from 'lucide-react';
import { api } from '../../api/client';
import { Appointment, Doctor } from '../../types';
import { useDoctorPortal } from '../../context/DoctorPortalContext';
import { getValidDoctorAvatar } from '../../layouts/DoctorLayout';
import { AppointmentsView } from './views/AppointmentsView';
import { PatientsView } from './views/PatientsView';
import { PrescriptionsView } from './views/PrescriptionsView';
import { AvailabilityView } from './views/AvailabilityView';
import { MessagesView } from './views/MessagesView';
import { ReportsView } from './views/ReportsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';

// High-fidelity fallback appointments matching Image 2 exactly
const STATIC_FALLBACK_APPOINTMENTS = [
  {
    _id: 'apt-001',
    timeRange: '10:00 AM - 10:30 AM',
    patientName: 'Sarah Jenkins',
    patientAge: 32,
    patientGender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    consultationType: 'VIDEO',
    typeLabel: 'Video Consultation',
    status: 'CONFIRMED',
    symptoms: 'Mild chest tightness upon morning exercise, routine cardiac evaluation request.',
    phone: '+1 (555) 100-0005',
    email: 'sarah.j@patient.medicare.demo',
    date: '2025-10-07',
    vitals: { bp: '118/78 mmHg', hr: '74 bpm', spo2: '99%', temp: '98.4 °F' },
    allergies: ['Penicillin', 'Sulfa Drugs'],
    timelineStatus: 'Completed',
  },
  {
    _id: 'apt-002',
    timeRange: '11:30 AM - 12:00 PM',
    patientName: 'James Wilson',
    patientAge: 45,
    patientGender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    consultationType: 'IN_PERSON',
    typeLabel: 'In-person Visit',
    status: 'CONFIRMED',
    symptoms: 'Follow-up for hypertension and medication review.',
    phone: '+1 (555) 234-8899',
    email: 'j.wilson@demo.com',
    date: '2025-10-07',
    vitals: { bp: '136/88 mmHg', hr: '82 bpm', spo2: '98%', temp: '98.6 °F' },
    allergies: ['None Reported'],
    timelineStatus: 'Scheduled',
  },
  {
    _id: 'apt-003',
    timeRange: '2:00 PM - 2:30 PM',
    patientName: 'Priya Sharma',
    patientAge: 28,
    patientGender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    consultationType: 'VIDEO',
    typeLabel: 'Video Consultation',
    status: 'PENDING',
    symptoms: 'Persistent headaches and sleep disturbances.',
    phone: '+1 (555) 345-7711',
    email: 'priya.s@demo.com',
    date: '2025-10-07',
    vitals: { bp: '122/80 mmHg', hr: '70 bpm', spo2: '99%', temp: '98.2 °F' },
    allergies: ['Aspirin (Mild Gastric)'],
    timelineStatus: 'Pending',
  },
  {
    _id: 'apt-004',
    timeRange: '4:00 PM - 4:30 PM',
    patientName: 'Robert Davis',
    patientAge: 60,
    patientGender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    consultationType: 'IN_PERSON',
    typeLabel: 'In-person Visit',
    status: 'CONFIRMED',
    symptoms: 'Regular check-up and cholesterol monitoring.',
    phone: '+1 (555) 890-4422',
    email: 'robert.davis@demo.com',
    date: '2025-10-07',
    vitals: { bp: '128/82 mmHg', hr: '68 bpm', spo2: '97%', temp: '98.5 °F' },
    allergies: ['Codeine'],
    timelineStatus: 'Scheduled',
  },
];

const PRESCRIPTION_TASKS = [
  {
    id: 'pr-1',
    patientName: 'Rahul Mehta',
    rxCode: 'Rx #PR-1024',
    status: 'Awaiting Approval',
    statusColor: 'bg-rose-50 text-rose-700 border-rose-200',
    iconColor: 'bg-rose-500 text-white',
    timeAgo: '1 day ago',
  },
  {
    id: 'pr-2',
    patientName: 'Anita Sharma',
    rxCode: 'Rx #PR-1023',
    status: 'Needs Clarification',
    statusColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconColor: 'bg-amber-500 text-white',
    timeAgo: '1 day ago',
  },
  {
    id: 'pr-3',
    patientName: 'Vikram Singh',
    rxCode: 'Rx #PR-1022',
    status: 'Approved',
    statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconColor: 'bg-emerald-500 text-white',
    timeAgo: '2 days ago',
  },
];

export const DoctorDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    searchQuery,
    doctorStatus,
    openVideoVisit,
    openPrescriptionWriter,
    openPatientEHR,
    openReschedule,
    openAvailability,
    openMessages,
    activeModal,
    activeAppointmentData,
    activePatientData,
    closeModal,
    activeSidebarTab,
  } = useDoctorPortal();

  const location = useLocation();
  const routeTab = location.pathname.replace(/^\/doctor\/?/, '').split('/')[0] || 'dashboard';
  const currentTab = activeSidebarTab || routeTab || 'dashboard';

  // Active view filters
  const [scheduleFilter, setScheduleFilter] = useState<'today' | 'week' | 'month'>('today');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(7);
  const [calendarMonth, setCalendarMonth] = useState('October 2025');

  // Video call controls state (for virtual telehealth modal)
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState('04:18');
  const [consultationNotes, setConsultationNotes] = useState('');

  // Prescription modal state
  const [selectedDrug, setSelectedDrug] = useState('Melatonin 5mg Dual-Release');
  const [dosageInstructions, setDosageInstructions] = useState('Take 1 tablet 30 minutes before bedtime with water.');
  const [prescriptionSuccess, setPrescriptionSuccess] = useState(false);

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState('2025-10-08');
  const [rescheduleSlot, setRescheduleSlot] = useState('11:00 AM');
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  // Chat message input for quick messages drawer
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'patient', text: 'Good morning Dr. Reyes, thank you for the consultation notes and morning exercise plan.', time: '10:15 AM' },
    { sender: 'doctor', text: 'You are welcome Sarah. Make sure to keep your hydration high and report any recurring tightness.', time: '10:18 AM' },
  ]);

  // Fetch real doctor self profile and stats if available
  const { data: meData } = useQuery({
    queryKey: ['doctorMe'],
    queryFn: () => api.get<{ profile: Doctor; stats: any }>('/doctors/portal/me'),
  });

  // Fetch real assigned appointments
  const { data: apptData } = useQuery({
    queryKey: ['doctorAssignedAppointments'],
    queryFn: () => api.get<{ appointments: Appointment[] }>('/appointments/doctor/assigned'),
  });

  const doctor = meData?.profile;
  const stats = meData?.stats || {};

  // Merge real appointments with static fallback data for 100% visual uptime
  const allAppointments = useMemo(() => {
    if (apptData?.appointments && apptData.appointments.length > 0) {
      // Map server appointments to match the rich schema
      const mappedServer = apptData.appointments.map((apt, idx) => ({
        _id: apt._id,
        timeRange: apt.timeSlot ? `${apt.timeSlot}` : '10:00 AM - 10:30 AM',
        patientName: apt.patientName || 'Sarah Jenkins',
        patientAge: apt.patientAge || 32,
        patientGender: apt.patientGender || 'Female',
        avatar:
          idx % 2 === 0
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
            : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
        consultationType: apt.consultationType || 'VIDEO',
        typeLabel: apt.consultationType === 'VIDEO' ? 'Video Consultation' : 'In-person Visit',
        status: apt.status || 'CONFIRMED',
        symptoms: apt.symptoms || 'Cardiac health assessment and regular consultation.',
        phone: apt.patientPhone || '+1 (555) 100-0005',
        email: apt.patientEmail || 'patient@medicare.demo',
        date: apt.date || '2025-10-07',
        vitals: { bp: '120/80 mmHg', hr: '72 bpm', spo2: '98%', temp: '98.6 °F' },
        allergies: ['Penicillin'],
        timelineStatus: apt.status === 'COMPLETED' ? 'Completed' : 'Scheduled',
      }));

      // Combine server appointments with fallback items to guarantee full schedule
      const existingNames = new Set(mappedServer.map((a) => a.patientName));
      const remainingFallbacks = STATIC_FALLBACK_APPOINTMENTS.filter((f) => !existingNames.has(f.patientName));
      return [...mappedServer, ...remainingFallbacks];
    }
    return STATIC_FALLBACK_APPOINTMENTS;
  }, [apptData]);

  // Filter appointments by search query and schedule tab
  const filteredAppointments = useMemo(() => {
    return allAppointments.filter((apt) => {
      const matchesSearch =
        searchQuery === '' ||
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.typeLabel.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [allAppointments, searchQuery]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'doctor', text: chatInput, time: 'Just now' },
    ]);
    setChatInput('');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto select-none">
      {/* 1. Dedicated Section Views */}
      {currentTab === 'appointments' && (
        <AppointmentsView
          appointments={allAppointments}
          onJoinVideo={openVideoVisit}
          onViewEHR={openPatientEHR}
          onWriteRx={openPrescriptionWriter}
          onReschedule={openReschedule}
        />
      )}

      {currentTab === 'patients' && (
        <PatientsView
          onViewEHR={openPatientEHR}
          onWriteRx={openPrescriptionWriter}
          onOpenMessage={openMessages}
        />
      )}

      {currentTab === 'prescriptions' && (
        <PrescriptionsView onOpenWriter={() => openPrescriptionWriter()} />
      )}

      {currentTab === 'availability' && <AvailabilityView />}

      {currentTab === 'messages' && <MessagesView onViewEHR={openPatientEHR} />}

      {currentTab === 'reports' && <ReportsView />}

      {currentTab === 'profile' && <ProfileView />}

      {currentTab === 'settings' && <SettingsView />}

      {/* 2. Default Clinical Dashboard Overview */}
      {(currentTab === 'dashboard' ||
        !['appointments', 'patients', 'prescriptions', 'availability', 'messages', 'reports', 'profile', 'settings'].includes(currentTab)) && (
        <>
          {/* ========================================================= */}
          {/* 1. TOP HERO WELCOME BANNER (POLISHED CLINICAL WORKSTATION) */}
          {/* ========================================================= */}
          <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-[#dcfce7]/70 via-[#ecfdf5] to-[#cffafe]/60 border border-teal-200/70 rounded-3xl p-6 sm:p-7 shadow-sm relative overflow-hidden"
      >
        {/* Subtle Ambient Halos */}
        <div className="absolute top-0 right-1/3 w-64 h-64 rounded-full bg-teal-300/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-48 h-48 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Doctor Avatar, Name & Specialization */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0">
              <img
                src={getValidDoctorAvatar(doctor?.avatar)}
                alt={doctor?.name || 'Dr. Sophia Reyes'}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div className="space-y-1">
              {/* Credentials Chip (Replacing redundant online badge, which is already in top bar) */}
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-900/10 border border-teal-600/30 text-teal-900 text-[11px] font-bold tracking-wide shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Fellow in Cardiovascular Medicine (FACC) • NPI #84920418</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Good Morning, {doctor?.name || 'Dr. Sophia Reyes'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Make a difference in your patients' lives today.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>{doctor?.specialization || 'Cardiologist'}</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>{doctor?.hospitalAffiliation || 'Medicare Heart & Vascular Institute'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Animated ECG Rhythm Monitor & Clinical Affirmation */}
          <div className="hidden lg:flex flex-col gap-2 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white/80 max-w-sm shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center shadow-sm">
                  <HeartPulse className="w-4 h-4 animate-pulse text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 leading-none">Vital Rhythm Protocol</p>
                  <p className="text-[10px] text-teal-700 font-bold">Sinus Rhythm • 72 BPM</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Active
              </span>
            </div>

            {/* Animated ECG Waveform */}
            <div className="h-7 w-full overflow-hidden relative rounded-lg bg-teal-950/5 flex items-center px-1">
              <svg className="w-full h-full" viewBox="0 0 200 40" fill="none" preserveAspectRatio="none">
                <path
                  d="M0,20 L30,20 L38,20 L44,8 L50,32 L56,12 L62,24 L68,20 L95,20 L103,20 L109,8 L115,32 L121,12 L127,24 L133,20 L160,20 L168,20 L174,8 L180,32 L186,12 L192,24 L200,20"
                  stroke="#0d9488"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-pulse"
                />
              </svg>
            </div>

            <p className="text-[11px] italic text-slate-600 line-clamp-1 leading-tight">
              “Health is not just the absence of disease, but a state of complete well-being.”
            </p>
          </div>
        </div>
      </motion.section>

      {/* ========================================================= */}
      {/* 2. ROW OF 4 METRIC STAT CARDS (ALIGNED & ANIMATED)        */}
      {/* ========================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Visits */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Today's Visits</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 tracking-tight">4</span>
              <button
                type="button"
                onClick={() => setScheduleFilter('today')}
                className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
                title="View today visits"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              1 completed • 3 remaining
            </p>
          </div>
        </motion.div>

        {/* Card 2: Upcoming Appointments */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-200 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Upcoming Appointments</span>
            <div className="w-9 h-9 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 tracking-tight">2</span>
              <button
                type="button"
                onClick={() => setScheduleFilter('week')}
                className="w-7 h-7 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 flex items-center justify-center transition"
                title="View upcoming"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              2 scheduled for afternoon
            </p>
          </div>
        </motion.div>

        {/* Card 3: Pending Requests */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-200 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Pending Requests</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 tracking-tight">1</span>
              <button
                type="button"
                onClick={() => openPatientEHR(STATIC_FALLBACK_APPOINTMENTS[2])}
                className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition"
                title="Review pending triage"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              1 awaiting clinical approval
            </p>
          </div>
        </motion.div>

        {/* Card 4: Completed Consultations */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-200 transition group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Completed Consultations</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black text-slate-900 tracking-tight">1</span>
              <button
                type="button"
                onClick={() => openPatientEHR(STATIC_FALLBACK_APPOINTMENTS[0])}
                className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition"
                title="View completed chart"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Sarah Jenkins charted
            </p>
          </div>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT GRID (SCHEDULE + RIGHT PANELS)  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ======================================================= */}
        {/* LEFT COLUMN: TODAY'S SCHEDULE & SUMMARY CARDS (8 COLS)  */}
        {/* ======================================================= */}
        <div className="xl:col-span-8 space-y-6">
          {/* Main Today's Schedule Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm">
            {/* Header: Title + Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Today's Schedule
                </h2>
              </div>

              {/* View filter tabs with sliding layoutId indicator */}
              <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl text-xs font-bold text-slate-600 relative">
                {(['today', 'week', 'month'] as const).map((tab) => {
                  const label = tab === 'today' ? 'Today' : tab === 'week' ? 'This Week' : 'This Month';
                  const isCurrent = scheduleFilter === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setScheduleFilter(tab)}
                      className={`relative px-3.5 py-1.5 rounded-xl transition font-bold z-10 ${
                        isCurrent ? 'text-teal-900' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isCurrent && (
                        <motion.span
                          layoutId="scheduleTabIndicator"
                          className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timeline Schedule Items */}
            <div className="mt-5 space-y-4 relative">
              {/* Continuous vertical timeline connector line */}
              <div className="hidden sm:block absolute left-[26px] top-6 bottom-6 w-0.5 bg-slate-200 -z-0" />

              {filteredAppointments.map((apt, idx) => {
                const isVideo = apt.consultationType === 'VIDEO';
                const isConfirmed = apt.status === 'CONFIRMED';
                const isCurrentLiveSlot = idx === 0;
                const dotColor =
                  idx === 0
                    ? 'bg-emerald-500'
                    : idx === 1
                    ? 'bg-emerald-500'
                    : idx === 2
                    ? 'bg-amber-500'
                    : 'bg-teal-500';

                return (
                  <motion.div
                    key={apt._id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.15 }}
                    className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-white border transition-all gap-4 z-10 ${
                      isCurrentLiveSlot
                        ? 'border-teal-400 ring-2 ring-teal-500/15 shadow-md bg-gradient-to-r from-teal-50/20 via-white to-white'
                        : 'border-slate-200/80 hover:border-teal-300 hover:shadow-md'
                    }`}
                  >
                    {/* Left: Dot & Time + Patient Avatar & Info (Clickable for EHR) */}
                    <div
                      onClick={() => openPatientEHR(apt)}
                      className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 cursor-pointer group"
                      title="Click to inspect Patient EHR Medical Record"
                    >
                      {/* Timeline Dot */}
                      <div className="hidden sm:flex flex-col items-center flex-shrink-0">
                        <span className={`w-3.5 h-3.5 rounded-full ${dotColor} ring-4 ring-white shadow-sm`} />
                      </div>

                      {/* Time Slot Tag */}
                      <div className="min-w-[125px] flex-shrink-0">
                        <span className="text-xs font-black text-slate-800 tracking-tight block">
                          {apt.timeRange}
                        </span>
                        {isCurrentLiveSlot && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 mt-0.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active Slot
                          </span>
                        )}
                      </div>

                      {/* Patient Avatar */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={apt.avatar}
                          alt={apt.patientName}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200';
                          }}
                          className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 shadow-sm group-hover:border-teal-500 transition-colors"
                        />
                        {isCurrentLiveSlot && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                        )}
                      </div>

                      {/* Patient Name, Age/Gender, Type & Concern */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                            {apt.patientName}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">
                            Age: {apt.patientAge} • {apt.patientGender}
                          </span>

                          {/* Consultation Type Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isVideo
                                ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {isVideo ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                            <span>{apt.typeLabel}</span>
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isConfirmed
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        {/* Reported Symptoms / Concern */}
                        <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                          <strong className="text-slate-700">Concern:</strong> {apt.symptoms}
                        </p>
                      </div>
                    </div>

                    {/* Right: Distinct Contextual Clinical Actions (Duplicate [View Patient] removed) */}
                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                      {/* Row 1: Active Telehealth Session -> Start Visit + EHR Chart */}
                      {idx === 0 && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => openVideoVisit(apt)}
                            className="min-h-[38px] px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-md shadow-teal-600/30 flex items-center gap-2 transition group"
                          >
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            <Video className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            <span>Start Telehealth Visit</span>
                          </motion.button>

                          <button
                            type="button"
                            onClick={() => openPatientEHR(apt)}
                            className="min-h-[38px] px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                            title="Inspect patient electronic health record"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            <span>Review EHR</span>
                          </button>
                        </>
                      )}

                      {/* Row 2: In-Person Appointment -> Reception Check-In + Reschedule */}
                      {idx === 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => openPatientEHR(apt)}
                            className="min-h-[38px] px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Check-In / Arrived</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openReschedule(apt)}
                            className="min-h-[38px] px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition"
                          >
                            <RefreshCw className="w-3 h-3 text-slate-400" />
                            <span>Reschedule</span>
                          </button>
                        </>
                      )}

                      {/* Row 3: Pending Consultation -> Accept & Triage + Decline */}
                      {idx === 2 && (
                        <>
                          <button
                            type="button"
                            onClick={() => openPrescriptionWriter(apt)}
                            className="min-h-[38px] px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Visit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openReschedule(apt)}
                            className="min-h-[38px] px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1 transition"
                          >
                            <X className="w-3.5 h-3.5 text-rose-500" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      {/* Row 4: Confirmed Follow-up -> Complete & Prescribe + Reschedule */}
                      {idx === 3 && (
                        <>
                          <button
                            type="button"
                            onClick={() => openPrescriptionWriter(apt)}
                            className="min-h-[38px] px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-xs flex items-center gap-1.5 transition"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                            <span>Prescribe & Chart</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openReschedule(apt)}
                            className="min-h-[38px] px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition"
                          >
                            <RefreshCw className="w-3 h-3 text-slate-400" />
                            <span>Reschedule</span>
                          </button>
                        </>
                      )}

                      {/* 3-Dots Dropdown Trigger */}
                      <button
                        type="button"
                        onClick={() => openPatientEHR(apt)}
                        className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                        title="Open comprehensive medical history"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ======================================================= */}
          {/* BOTTOM ROW: 3 SUMMARY WIDGETS                           */}
          {/* ======================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Widget 1: Today's Timeline */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    Today's Timeline
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setScheduleFilter('today')}
                  className="text-[11px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-0.5"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {STATIC_FALLBACK_APPOINTMENTS.map((apt, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-800 block text-[11px]">
                        {apt.timeRange.split(' - ')[0]} • {apt.patientName}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {apt.typeLabel}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        apt.timelineStatus === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : apt.timelineStatus === 'Pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {apt.timelineStatus === 'Completed' ? '✓ ' : '● '}
                      {apt.timelineStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Recent Patients */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-600" />
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    Recent Patients
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => openPatientEHR(STATIC_FALLBACK_APPOINTMENTS[0])}
                  className="text-[11px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-0.5"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {STATIC_FALLBACK_APPOINTMENTS.map((apt, i) => (
                  <div
                    key={i}
                    onClick={() => openPatientEHR(apt)}
                    className="flex items-center justify-between hover:bg-slate-50 p-1.5 rounded-xl transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={apt.avatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block text-xs truncate">
                          {apt.patientName}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {apt.patientAge} • {apt.patientGender}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      {apt.timeRange.split(' - ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 3: Prescription Tasks */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    Prescription Tasks
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => openPrescriptionWriter()}
                  className="text-[11px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-0.5"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5">
                {PRESCRIPTION_TASKS.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openPrescriptionWriter({ patientName: task.patientName })}
                    className="flex items-center justify-between hover:bg-slate-50 p-1.5 rounded-xl transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-lg ${task.iconColor} flex items-center justify-center text-[10px] font-black flex-shrink-0`}>
                        Rx
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block text-xs truncate">
                          {task.patientName}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {task.rxCode} • {task.status}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {task.timeAgo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: CALENDAR, LIVE TRIAGE QUEUE & PERFORMANCE */}
        {/* ======================================================= */}
        <div className="xl:col-span-4 space-y-6">
          {/* 1. Interactive Mini Calendar Widget */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">
                {calendarMonth}
              </span>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => setCalendarMonth('September 2025')}
                  className="p-1 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarMonth('October 2025')}
                  className="p-1 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
              {/* Previous month days */}
              <span className="py-1.5 text-slate-300">28</span>
              <span className="py-1.5 text-slate-300">29</span>
              <span className="py-1.5 text-slate-300">30</span>
              {/* Current month days */}
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isSelected = selectedCalendarDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedCalendarDay(day)}
                    className={`py-1.5 rounded-full transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white font-black shadow-md shadow-teal-600/30 scale-105'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
              {/* Next month days */}
              <span className="py-1.5 text-slate-300">1</span>
              <span className="py-1.5 text-slate-300">2</span>
            </div>
          </div>

          {/* 2. REPLACED DUPLICATE QUICK ACTIONS WITH LIVE TRIAGE & VITALS MONITOR */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Live Triage & Vitals Queue
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Virtual Room 1
              </span>
            </div>

            {/* Waiting Room Patient Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
                    alt="Sarah Jenkins"
                    className="w-9 h-9 rounded-full object-cover border-2 border-teal-500"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">Sarah Jenkins</h4>
                    <p className="text-[10px] text-slate-500">Virtual Waiting Room • 8 min</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black">
                  Ready
                </span>
              </div>

              {/* Vitals Mini-Grid */}
              <div className="grid grid-cols-4 gap-1.5 text-center bg-white p-2 rounded-xl border border-slate-200/60">
                <div className="p-1">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">BP</span>
                  <span className="text-xs font-black text-slate-800">118/78</span>
                </div>
                <div className="p-1">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">HR</span>
                  <span className="text-xs font-black text-teal-700">74 bpm</span>
                </div>
                <div className="p-1">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">SpO2</span>
                  <span className="text-xs font-black text-emerald-700">99%</span>
                </div>
                <div className="p-1">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Temp</span>
                  <span className="text-xs font-black text-slate-800">98.4°F</span>
                </div>
              </div>

              {/* Quick Launch Consultation */}
              <button
                type="button"
                onClick={() => openVideoVisit(STATIC_FALLBACK_APPOINTMENTS[0])}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 transition group"
              >
                <Video className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Enter Video Consultation Room</span>
              </button>
            </div>

            {/* Clinical Target Metrics */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Clinical Schedule Target</span>
                <span className="text-teal-700">4 / 4 Patients (100%)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full w-full" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Physician Quality Rating: <strong className="text-slate-800">4.9 ★</strong></span>
                <span>Avg Consult: <strong className="text-slate-800">18m</strong></span>
              </div>
            </div>
          </motion.div>

          {/* 3. Notifications Card matching Image 2 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Notifications
              </h3>
              <button
                type="button"
                onClick={openMessages}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-0.5"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Item 1 */}
              <div
                onClick={openMessages}
                className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    New message from Sarah Jenkins
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    “Thank you for the consultation...”
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  10:15 AM
                </span>
              </div>

              {/* Item 2 */}
              <div
                onClick={() => openPrescriptionWriter({ patientName: 'Sarah Jenkins' })}
                className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    Prescription #PR-1023 needs review
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    Medications require approval
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  9:42 AM
                </span>
              </div>

              {/* Item 3 */}
              <div
                onClick={() => openPatientEHR(STATIC_FALLBACK_APPOINTMENTS[1])}
                className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    Appointment reminder
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    James Wilson - 11:30 AM
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  8:00 AM
                </span>
              </div>

              {/* Item 4 */}
              <div className="flex items-start gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    System update
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    New features are now available
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  Yesterday
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* ========================================================= */}
      {/* 4. INTERACTIVE CLINICAL MODALS (RESPONSIVE & ANIMATED)     */}
      {/* ========================================================= */}

      {/* MODAL 1: Telehealth Video Consultation Room */}
      <AnimatePresence>
        {activeModal === 'video-visit' && activeAppointmentData && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="bg-slate-900 text-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-800"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      Encrypted Telehealth Consultation • {activeAppointmentData.patientName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Duration: <span className="font-mono text-emerald-400 font-bold">{callDuration}</span> • 256-Bit HIPAA Compliant Stream
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Video Stream Simulation */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 min-h-[380px] bg-slate-950">
                {/* Video Stage */}
                <div className="lg:col-span-2 relative bg-slate-900 flex items-center justify-center overflow-hidden border-r border-slate-800">
                  {/* Patient Simulated Feed */}
                  <img
                    src={activeAppointmentData.avatar}
                    alt={activeAppointmentData.patientName}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />

                  {/* Patient Name Tag */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-xs font-bold">
                    <span>{activeAppointmentData.patientName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>

                  {/* Doctor Picture-in-Picture Feed */}
                  <div className="absolute top-4 right-4 w-28 h-20 sm:w-36 sm:h-24 rounded-2xl overflow-hidden border-2 border-teal-500/80 shadow-xl bg-slate-800">
                    <img
                      src={doctor?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                      alt="Doctor Self View"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold">
                      You
                    </div>
                  </div>
                </div>

                {/* Right Side: Live Clinical Notes Pad */}
                <div className="p-4 sm:p-5 flex flex-col justify-between bg-slate-900 text-xs space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-teal-400" />
                      <span>Live Clinical Assessment</span>
                    </h4>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Reported Concern</span>
                      <p className="text-slate-300">{activeAppointmentData.symptoms}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Doctor Clinical Notes</span>
                      <textarea
                        rows={4}
                        value={consultationNotes}
                        onChange={(e) => setConsultationNotes(e.target.value)}
                        placeholder="Type observation, diagnostic remarks, or prescribe regimen..."
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      closeModal();
                      openPrescriptionWriter(activeAppointmentData);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Generate Prescription & Finish</span>
                  </button>
                </div>
              </div>

              {/* Footer Dock Controls */}
              <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-2xl transition ${
                    isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-2xl transition ${
                    isVideoOff ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isVideoOff ? 'Turn video on' : 'Turn video off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <button
                  onClick={closeModal}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-900/40 transition"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Visit</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Complete & Prescribe / Write Prescription */}
      <AnimatePresence>
        {activeModal === 'prescription' && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                    Rx
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Medical Prescription Composer
                    </h3>
                    <p className="text-xs text-slate-400">
                      Patient: <span className="font-bold text-slate-700">{activeAppointmentData?.patientName || 'Sarah Jenkins'}</span>
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {prescriptionSuccess ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-emerald-900 text-base">Prescription Certified & Dispatched</h4>
                  <p className="text-xs text-emerald-700">
                    The electronic prescription has been signed by Dr. Sophia Reyes and securely sent to clinical pharmacy dispensing.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Medication Selection</label>
                    <select
                      value={selectedDrug}
                      onChange={(e) => setSelectedDrug(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                    >
                      <option value="Melatonin 5mg Dual-Release">Melatonin 5mg Dual-Release (100 Tablets)</option>
                      <option value="Montelukast Sodium 10mg">Montelukast Sodium 10mg (Chewable)</option>
                      <option value="Paracetamol 500mg Rapid Release">Paracetamol 500mg Rapid Release (32 Tabs)</option>
                      <option value="Amoxicillin 500mg Broad-Spectrum">Amoxicillin 500mg (20 Capsules)</option>
                      <option value="Atorvastatin Calcium 20mg">Atorvastatin Calcium 20mg (30 Tablets)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Clinical Dosage & Frequency</label>
                    <textarea
                      rows={3}
                      value={dosageInstructions}
                      onChange={(e) => setDosageInstructions(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      <span>Digital MD Signature Attached</span>
                    </div>
                    <span className="font-mono text-slate-400">MD-LIC-89210</span>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPrescriptionSuccess(true);
                        setTimeout(() => {
                          setPrescriptionSuccess(false);
                          closeModal();
                        }, 2200);
                      }}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/20"
                    >
                      Sign & Issue Prescription
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: View Patient Electronic Health Record (EHR) */}
      <AnimatePresence>
        {activeModal === 'patient-ehr' && activePatientData && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={activePatientData.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover border-2 border-teal-500/40"
                  />
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {activePatientData.patientName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Age: {activePatientData.patientAge} • {activePatientData.patientGender} • ID #PT-90412
                    </p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-4 gap-2.5 p-3 rounded-2xl bg-teal-50/70 border border-teal-100 text-center">
                <div>
                  <span className="text-[10px] text-teal-700 font-bold uppercase block">Blood Pressure</span>
                  <span className="text-xs font-black text-slate-900">{activePatientData.vitals?.bp || '118/78'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-700 font-bold uppercase block">Heart Rate</span>
                  <span className="text-xs font-black text-slate-900">{activePatientData.vitals?.hr || '74 bpm'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-700 font-bold uppercase block">Oxygen SpO2</span>
                  <span className="text-xs font-black text-slate-900">{activePatientData.vitals?.spo2 || '99%'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-teal-700 font-bold uppercase block">Body Temp</span>
                  <span className="text-xs font-black text-slate-900">{activePatientData.vitals?.temp || '98.4 °F'}</span>
                </div>
              </div>

              {/* Medical History & Allergies */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">Active Diagnosis & History</h4>
                <p className="text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed">
                  Patient presented with mild chest tightness following morning aerobic conditioning. Electrocardiogram and cardiac enzyme screen conducted with no acute ischemic changes. Advised rest, scheduled follow-up.
                </p>

                <h4 className="font-bold text-slate-900 pt-2">Known Allergies</h4>
                <div className="flex flex-wrap gap-2">
                  {(activePatientData.allergies || ['Penicillin']).map((allergy: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]"
                    >
                      ⚠ {allergy}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    closeModal();
                    openMessages();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    openPrescriptionWriter(activePatientData);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold text-xs text-white shadow-md shadow-teal-600/20"
                >
                  Issue New Prescription
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Reschedule Appointment Modal */}
      <AnimatePresence>
        {activeModal === 'reschedule' && activeAppointmentData && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-teal-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Reschedule Appointment
                  </h3>
                </div>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Select a new consultation slot for <strong className="text-slate-800">{activeAppointmentData.patientName}</strong>.
              </p>

              {rescheduleSuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-900">Visit Rescheduled to {rescheduleDate} at {rescheduleSlot}</p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">New Date</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Time Slot</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['09:30 AM', '11:00 AM', '02:30 PM', '03:45 PM', '04:30 PM', '05:15 PM'].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setRescheduleSlot(slot)}
                          className={`p-2 rounded-xl text-center font-bold text-xs transition ${
                            rescheduleSlot === slot
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setRescheduleSuccess(true);
                        setTimeout(() => {
                          setRescheduleSuccess(false);
                          closeModal();
                        }, 1800);
                      }}
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm"
                    >
                      Confirm New Slot
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: Check Availability / Consultation Hours */}
      <AnimatePresence>
        {activeModal === 'availability' && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Clinical Availability & Hours
                  </h3>
                </div>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200">
                  <span className="font-bold text-teal-900 block">Weekly Working Days</span>
                  <span className="text-teal-700 text-[11px]">Monday to Saturday • 9:00 AM – 6:00 PM EST</span>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Standard Telehealth Consultation Fee</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-lg text-slate-900">
                    $120.00 USD
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={closeModal}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER 6: Quick Patient Messages Drawer */}
      <AnimatePresence>
        {activeModal === 'messages' && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between"
            >
              <div className="p-4 sm:p-5 bg-teal-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
                    alt="Sarah Jenkins"
                    className="w-10 h-10 rounded-full object-cover border-2 border-teal-400"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Sarah Jenkins</h3>
                    <p className="text-[11px] text-teal-300">Active Patient • Direct Clinical Channel</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 text-teal-200 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'doctor' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.sender === 'doctor'
                          ? 'bg-teal-600 text-white rounded-br-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type message to Sarah Jenkins..."
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex-shrink-0 transition"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
