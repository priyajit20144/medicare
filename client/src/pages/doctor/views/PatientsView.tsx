import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  FileText,
  MessageSquare,
  Stethoscope,
  Phone,
  Mail,
  HeartPulse,
  AlertCircle,
  Calendar,
  Clock,
  ChevronRight,
  ShieldAlert,
  Droplet,
} from 'lucide-react';

interface PatientsViewProps {
  onViewEHR: (patient: any) => void;
  onWriteRx: (patient: any) => void;
  onOpenMessage?: (patient: any) => void;
}

const STATIC_PATIENTS = [
  {
    id: 'p-001',
    name: 'Sarah Jenkins',
    age: 32,
    gender: 'Female',
    bloodGroup: 'O+',
    phone: '+1 (555) 100-0005',
    email: 'sarah.j@patient.medicare.demo',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    primaryCondition: 'Mild Angina / Cardiac Assessment',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    lastVisit: '2025-10-07',
    totalVisits: 4,
    vitals: { bp: '118/78 mmHg', hr: '74 bpm', spo2: '99%', temp: '98.4 °F' },
  },
  {
    id: 'p-002',
    name: 'James Wilson',
    age: 45,
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '+1 (555) 234-8899',
    email: 'j.wilson@demo.com',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    primaryCondition: 'Essential Hypertension (Stage 1)',
    allergies: ['None Reported'],
    lastVisit: '2025-10-07',
    totalVisits: 7,
    vitals: { bp: '136/88 mmHg', hr: '82 bpm', spo2: '98%', temp: '98.6 °F' },
  },
  {
    id: 'p-003',
    name: 'Priya Sharma',
    age: 28,
    gender: 'Female',
    bloodGroup: 'B+',
    phone: '+1 (555) 345-7711',
    email: 'priya.s@demo.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    primaryCondition: 'Chronic Migraine & Sleep Disorder',
    allergies: ['Aspirin (Mild Gastric)'],
    lastVisit: '2025-09-28',
    totalVisits: 3,
    vitals: { bp: '122/80 mmHg', hr: '70 bpm', spo2: '99%', temp: '98.2 °F' },
  },
  {
    id: 'p-004',
    name: 'Robert Davis',
    age: 60,
    gender: 'Male',
    bloodGroup: 'AB+',
    phone: '+1 (555) 890-4422',
    email: 'robert.davis@demo.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    primaryCondition: 'Hypercholesterolemia & Type 2 Diabetes',
    allergies: ['Codeine'],
    lastVisit: '2025-09-15',
    totalVisits: 12,
    vitals: { bp: '128/82 mmHg', hr: '68 bpm', spo2: '97%', temp: '98.5 °F' },
  },
  {
    id: 'p-005',
    name: 'Elena Rostova',
    age: 39,
    gender: 'Female',
    bloodGroup: 'O-',
    phone: '+1 (555) 456-7890',
    email: 'elena.rostova@demo.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    primaryCondition: 'Thyroid Dysregulation (Hypothyroid)',
    allergies: ['Iodinated Contrast'],
    lastVisit: '2025-09-02',
    totalVisits: 5,
    vitals: { bp: '116/74 mmHg', hr: '66 bpm', spo2: '99%', temp: '98.1 °F' },
  },
  {
    id: 'p-006',
    name: 'Marcus Brody',
    age: 52,
    gender: 'Male',
    bloodGroup: 'B-',
    phone: '+1 (555) 789-0123',
    email: 'marcus.brody@demo.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    primaryCondition: 'Post-CABG Cardiac Rehabilitation',
    allergies: ['None Reported'],
    lastVisit: '2025-08-20',
    totalVisits: 9,
    vitals: { bp: '124/80 mmHg', hr: '72 bpm', spo2: '98%', temp: '98.3 °F' },
  },
];

export const PatientsView: React.FC<PatientsViewProps> = ({
  onViewEHR,
  onWriteRx,
  onOpenMessage,
}) => {
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('ALL');

  const filteredPatients = useMemo(() => {
    return STATIC_PATIENTS.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.primaryCondition.toLowerCase().includes(q);

      const matchCondition =
        conditionFilter === 'ALL' ||
        (conditionFilter === 'CARDIAC' && p.primaryCondition.toLowerCase().includes('cardiac')) ||
        (conditionFilter === 'HYPERTENSION' && p.primaryCondition.toLowerCase().includes('hypertension')) ||
        (conditionFilter === 'DIABETES' && p.primaryCondition.toLowerCase().includes('diabetes'));

      return matchSearch && matchCondition;
    });
  }, [search, conditionFilter]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-500/20">
              <Users className="w-5 h-5 text-teal-600" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Patients Clinical Registry</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access comprehensive patient electronic health records (EHR), recorded diagnoses, allergy telemetry, and medication histories.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cohort</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{STATIC_PATIENTS.length * 24}</p>
          <span className="text-[11px] text-slate-400">Registered patients</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Chronic Care</span>
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1.5">38</p>
          <span className="text-[11px] text-slate-400">Continuous monitoring</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Allergy Alerts</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1.5">14</p>
          <span className="text-[11px] text-slate-400">Flags recorded</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active Visits</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1.5">16</p>
          <span className="text-[11px] text-slate-400">This month</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row gap-3 md:items-center justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients by name, email, phone, or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Clinical Categories</option>
            <option value="CARDIAC">Cardiac & Vascular</option>
            <option value="HYPERTENSION">Hypertension</option>
            <option value="DIABETES">Endocrine & Diabetes</option>
          </select>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredPatients.map((patient) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/90 hover:border-teal-500/40 rounded-3xl p-5 sm:p-6 transition shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Patient Header */}
              <div className="flex items-start gap-4">
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 flex-shrink-0 shadow-xs"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-slate-900 text-base truncate">{patient.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                    <span>{patient.age} yrs</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                    <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-700 font-bold px-1.5 py-0.2 rounded text-[10px] border border-rose-200">
                      <Droplet className="w-2.5 h-2.5" /> {patient.bloodGroup}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-teal-800 bg-teal-50/80 px-2 py-0.5 rounded-md mt-2 inline-block truncate max-w-full">
                    {patient.primaryCondition}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Last Visit: {patient.lastVisit} ({patient.totalVisits} total visits)</span>
                </div>
              </div>

              {/* Vitals Baseline */}
              <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Baseline Vitals:
                </span>
                <div className="flex flex-wrap gap-2 text-slate-600 font-mono">
                  <span>BP: {patient.vitals.bp}</span>
                  <span>HR: {patient.vitals.hr}</span>
                  <span>SpO2: {patient.vitals.spo2}</span>
                </div>
              </div>

              {/* Allergies */}
              {patient.allergies.length > 0 && patient.allergies[0] !== 'None Reported' && (
                <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate font-semibold">Allergies: {patient.allergies.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onViewEHR(patient)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>View EHR</span>
              </button>

              <button
                onClick={() => onWriteRx(patient)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Write Rx</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
