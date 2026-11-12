import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Pill,
  Activity,
  Award,
  Clock,
  Lock,
  Users,
  CheckCircle2,
  ArrowRight,
  Building2,
} from 'lucide-react';

const PLATFORM_METRICS = [
  { label: 'Active Patients', value: '1M+', icon: Users },
  { label: 'Verified Doctors', value: '850+', icon: Stethoscope },
  { label: 'Certified Pharmacies', value: '120+', icon: Pill },
  { label: 'Diagnostic Labs', value: '65+', icon: Building2 },
];

const CORE_PILLARS = [
  {
    title: 'Licensed Clinical Review',
    description:
      'Every prescription upload is audited by a board-licensed pharmacist before dispensing, catching interactions and ensuring safe dosages.',
    icon: ShieldCheck,
  },
  {
    title: 'Cold-Chain Pharmacy Integrity',
    description:
      'Temperature-sensitive biologics, insulin, and chronic medications ship in calibrated insulated packaging with batch traceability.',
    icon: Pill,
  },
  {
    title: 'Telehealth & Specialist Care',
    description:
      'Connect seamlessly with cardiologists, dermatologists, pediatricians, and primary physicians via clinic visits or HD telehealth.',
    icon: Stethoscope,
  },
  {
    title: 'Encrypted Health Privacy',
    description:
      'Your medical history, lab biomarkers, and prescriptions are stored using strict role-based authorization and audit logging.',
    icon: Lock,
  },
];

const CARE_COMMITMENTS = [
  '24/7 clinical pharmacist guidance and medication safety checks',
  'Home blood & diagnostic sample collection with digital lab sign-off',
  'Transparent upfront consultation fees and real-time order tracking',
  'Integrated health records unifying pharmacy, doctors, and diagnostics',
];

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#0f2d42] via-[#0b4b55] to-[#0d766e] text-white overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative z-10">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-emerald-200 text-xs font-bold tracking-wider uppercase">
              <HeartPulse className="w-4 h-4" /> About Medicare Healthcare
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Connected Clinical Care, Built Around Patient Trust.
            </h1>
            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-2xl">
              Medicare bridges digital pharmacy fulfillment, board-certified doctor consultations,
              and accredited diagnostic labs inside one unified, transparent patient ecosystem.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/doctors"
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition shadow-lg flex items-center gap-2"
              >
                Explore Specialists <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/25 transition flex items-center gap-2"
              >
                Contact Patient Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {PLATFORM_METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-md flex items-center gap-3.5"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">
                    {metric.value}
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-slate-500">
                    {metric.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Clinical Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            How We Deliver Care
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Clinical Safety & Precision at Every Step
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            From prescription verification to cold-chain dispatch and follow-up lab checkups,
            every workflow is engineered for medical reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CORE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{pillar.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mission & Commitment Split */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold">
              <Award className="w-4 h-4" /> Accredited Healthcare Standards
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Making Quality Healthcare Accessible From Home
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Managing chronic care or acute prescriptions shouldn’t require juggling disconnected
              clinics, paper slips, and pharmacy lines. Medicare brings licensed care providers and
              authentic medications directly to your doorstep.
            </p>
            <ul className="space-y-2.5 pt-1">
              {CARE_COMMITMENTS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-50 to-teal-50/70 rounded-2xl border border-emerald-200/80 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">24/7 Care Coordination</h3>
                <p className="text-xs text-slate-500">Always-on pharmacist & patient support</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Have a question about an order, dosage schedule, doctor booking, or lab panel? Reach
              our support team any time of day.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Link
                to="/medicines"
                className="py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 font-bold text-xs text-center transition"
              >
                Browse Pharmacy
              </Link>
              <Link
                to="/health-checkups"
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center transition flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" /> Book Checkup
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

