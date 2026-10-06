import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  User,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Check,
  Stethoscope,
  ChevronRight,
  Phone,
  Mail,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface AppointmentsViewProps {
  appointments: any[];
  onJoinVideo: (appt: any) => void;
  onViewEHR: (patient: any) => void;
  onWriteRx: (appt: any) => void;
  onReschedule: (appt: any) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onJoinVideo,
  onViewEHR,
  onWriteRx,
  onReschedule,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        apt.patientName.toLowerCase().includes(q) ||
        (apt.symptoms && apt.symptoms.toLowerCase().includes(q)) ||
        (apt.phone && apt.phone.toLowerCase().includes(q));

      const isCompletedLocally = completedIds.includes(apt._id);
      const effectiveStatus = isCompletedLocally ? 'COMPLETED' : apt.status;

      const matchStatus = statusFilter === 'ALL' || effectiveStatus === statusFilter;
      const matchType = typeFilter === 'ALL' || apt.consultationType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [appointments, search, statusFilter, typeFilter, completedIds]);

  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMED' && !completedIds.includes(a._id)).length;
    const pending = appointments.filter((a) => a.status === 'PENDING').length;
    const completed = appointments.filter((a) => a.status === 'COMPLETED' || completedIds.includes(a._id)).length;
    const video = appointments.filter((a) => a.consultationType === 'VIDEO').length;
    return { total, confirmed, pending, completed, video };
  }, [appointments, completedIds]);

  const handleMarkComplete = (id: string) => {
    setCompletedIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-500/20">
              <Calendar className="w-5 h-5 text-teal-600" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Clinical Consultations & Schedule</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your patient schedule, initiate telehealth consultations, review clinical intakes, and track completion.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Booked</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{stats.total}</p>
          <span className="text-[11px] text-slate-400">Active consultations</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1.5">{stats.confirmed}</p>
          <span className="text-[11px] text-slate-400">Ready for session</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1.5">{stats.pending}</p>
          <span className="text-[11px] text-slate-400">Awaiting check-in</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">Telehealth</span>
            <Video className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-black text-cyan-600 mt-1.5">{stats.video}</p>
          <span className="text-[11px] text-slate-400">Video consultations</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Completed</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-1.5">{stats.completed}</p>
          <span className="text-[11px] text-slate-400">Successfully closed</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row gap-3 md:items-center justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, symptoms, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format filter */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Formats</option>
              <option value="VIDEO">Video Telehealth</option>
              <option value="IN_PERSON">In-Clinic Visit</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">No appointments match your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or filter options to view scheduled clinical consultations.
            </p>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isCompleted = completedIds.includes(apt._id) || apt.status === 'COMPLETED';

            return (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200/90 hover:border-teal-500/40 rounded-3xl p-5 sm:p-6 transition shadow-xs space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Patient Info & Avatar */}
                  <div className="flex items-start gap-4">
                    <img
                      src={apt.avatar}
                      alt={apt.patientName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 flex-shrink-0 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200';
                      }}
                    />

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-slate-900 text-base">{apt.patientName}</h3>
                        <span className="text-xs text-slate-500 font-medium">
                          {apt.patientAge} yrs, {apt.patientGender}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : apt.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isCompleted ? 'COMPLETED' : apt.status}
                        </span>
                      </div>

                      {/* Contact & Date row */}
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          {apt.timeRange}
                        </span>

                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {apt.date || 'Today'}
                        </span>

                        {apt.consultationType === 'VIDEO' ? (
                          <span className="flex items-center gap-1 font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                            <Video className="w-3 h-3 text-cyan-600" /> Telehealth Video
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            <User className="w-3 h-3" /> In-Clinic
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {apt.consultationType === 'VIDEO' && !isCompleted && (
                      <button
                        onClick={() => onJoinVideo(apt)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Call</span>
                      </button>
                    )}

                    <button
                      onClick={() => onViewEHR(apt)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>EHR Record</span>
                    </button>

                    <button
                      onClick={() => onWriteRx(apt)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 transition"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>Write Rx</span>
                    </button>

                    {!isCompleted ? (
                      <button
                        onClick={() => handleMarkComplete(apt._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition"
                        title="Mark Consultation Complete"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Complete</span>
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-blue-700 font-bold bg-blue-50 px-3 py-2 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Session Closed
                      </span>
                    )}

                    <button
                      onClick={() => onReschedule(apt)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                      title="Reschedule Appointment"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Symptoms & Clinical Intake Notes */}
                {apt.symptoms && (
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                      Chief Complaint / Reported Symptoms:
                    </span>
                    <p className="italic text-slate-600 leading-relaxed">{apt.symptoms}</p>
                  </div>
                )}

                {/* Patient Vitals Preview Chips */}
                {apt.vitals && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Vitals Snapshot:
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-800">
                      BP: {apt.vitals.bp}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-800">
                      HR: {apt.vitals.hr}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-800">
                      SpO2: {apt.vitals.spo2}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-800">
                      Temp: {apt.vitals.temp}
                    </span>
                    {apt.allergies && apt.allergies.length > 0 && (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-bold">
                        Allergies: {apt.allergies.join(', ')}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
