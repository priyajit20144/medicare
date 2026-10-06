import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Stethoscope,
  Video,
  Eye,
  X,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { api } from '../../api/client';
import { Appointment } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminAppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminAppointments', statusFilter],
    queryFn: () =>
      api.get<{ appointments: Appointment[]; total: number }>(
        `/appointments/admin/all${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`
      ),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { id: string; status: string; notes?: string }) =>
      api.patch(`/appointments/${vars.id}/status`, {
        status: vars.status,
        notes: vars.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['adminAnalyticsOverview'] });
      setSelectedAppt(null);
      setNewStatus('');
      setNotes('');
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to update appointment status');
    },
  });

  const handleOpenModal = (appt: Appointment) => {
    setSelectedAppt(appt);
    setNewStatus(appt.status);
    setNotes(appt.notes || '');
    setActionError(null);
  };

  const appointments = data?.appointments || [];
  const filtered = appointments.filter((a) => {
    const term = searchTerm.toLowerCase();
    const docName = a.doctor?.name?.toLowerCase() || '';
    const patientName = a.patientName?.toLowerCase() || a.user?.name?.toLowerCase() || '';
    const specialty = a.doctor?.specialty?.toLowerCase() || '';
    return docName.includes(term) || patientName.includes(term) || specialty.includes(term);
  });

  if (isLoading) {
    return <LoadingState message="Loading administrative clinical schedule..." minHeight="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Appointments Oversight & Scheduling</h1>
          <p className="text-sm text-slate-400">
            Monitor clinical sessions across all doctors, confirm bookings, prevent schedule bottlenecks, and audit consultations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/doctors"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl transition shrink-0"
          >
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span>Physicians Directory</span>
          </Link>
          <Link
            to="/admin/doctors?action=new"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/40 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Physician Manually</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Doctor, Patient or Specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="There are currently no doctor consultations matching this search criteria."
          icon={Calendar}
        />
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-left text-sm text-slate-300 min-w-[720px]">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-xs font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Doctor</th>
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Date & Slot</th>
                  <th className="py-4 px-6">Format</th>
                  <th className="py-4 px-6">Fee</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
                        {appt.doctor?.name || 'Physician'}
                      </div>
                      <div className="text-xs text-slate-400 pl-6">{appt.doctor?.specialty}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{appt.patientName || appt.user?.name}</div>
                      <div className="text-xs text-slate-400">{appt.user?.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {appt.timeSlot}
                      </div>
                      <div className="text-xs text-slate-400">{appt.date}</div>
                    </td>
                    <td className="py-4 px-6">
                      {appt.type === 'VIDEO' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800/40">
                          <Video className="w-3 h-3" /> Telehealth
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                          <User className="w-3 h-3" /> In-Clinic
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-white">
                      ${appt.fee?.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={appt.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenModal(appt)}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manage Appointment Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" /> Clinical Session Oversight
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedAppt.date} at {selectedAppt.timeSlot}
                </p>
              </div>
              <button
                onClick={() => setSelectedAppt(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                {actionError}
              </div>
            )}

            {/* Details */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Physician:</span>
                <span className="text-white font-semibold">{selectedAppt.doctor?.name} ({selectedAppt.doctor?.specialty})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="text-white font-semibold">{selectedAppt.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consultation Type:</span>
                <span className="text-slate-200">{selectedAppt.type}</span>
              </div>
              {selectedAppt.symptoms && (
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 text-xs block mb-1">Reported Symptoms:</span>
                  <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    {selectedAppt.symptoms}
                  </p>
                </div>
              )}
            </div>

            {/* Status Modification */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Update Booking Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Administrative / Clinical Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Reason for change, room assignment, or clinical feedback..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition"
              >
                Close
              </button>
              <button
                type="button"
                disabled={updateStatusMutation.isPending}
                onClick={() =>
                  updateStatusMutation.mutate({
                    id: selectedAppt._id,
                    status: newStatus,
                    notes,
                  })
                }
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Save Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
