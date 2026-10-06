import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  FileText,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  XCircle,
} from 'lucide-react';
import { api } from '../../api/client';
import { Appointment } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const UserAppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: () => api.get<{ appointments: Appointment[]; pagination: any }>('/appointments/my'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/status`, { status: 'CANCELLED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
    },
  });

  const appointments = response?.appointments || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            My Doctor Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your booked specialist consultations, join telehealth visits, and view physician prescriptions.
          </p>
        </div>

        <Link
          to="/doctors"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" /> Book New Consultation
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Consultations Scheduled"
          description="You don't have any upcoming doctor appointments. Schedule a video visit or in-person consultation with a specialist."
          actionText="Find Specialist Doctor"
          actionLink="/doctors"
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const isVideo = apt.consultationType === 'VIDEO';
            const canCancel = ['PENDING', 'CONFIRMED'].includes(apt.status);

            return (
              <div
                key={apt._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={apt.doctorId?.avatar || 'https://images.unsplash.com/photo-1594824813511-19d452093e9a?auto=format&fit=crop&q=80&w=150'}
                      alt=""
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{apt.doctorId?.name}</h3>
                      <p className="text-xs font-semibold text-emerald-600">
                        {apt.doctorId?.specialization}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Booking #{apt.appointmentNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={apt.status} />
                    <span className="font-bold text-xs text-slate-900">${apt.fee}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Date</span>
                      <strong className="text-slate-800">{apt.date}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Time Slot</span>
                      <strong className="text-slate-800">{apt.timeSlot}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isVideo ? (
                      <Video className="w-4 h-4 text-blue-600" />
                    ) : (
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    )}
                    <div>
                      <span className="text-slate-400 block text-[10px]">Mode</span>
                      <strong className="text-slate-800">
                        {isVideo ? 'Telehealth Video Call' : 'In-Person Clinic Visit'}
                      </strong>
                    </div>
                  </div>
                </div>

                {apt.symptoms && (
                  <p className="text-xs text-slate-500">
                    <strong>Reported Symptoms:</strong> {apt.symptoms}
                  </p>
                )}

                {apt.prescriptionGiven && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <strong className="block font-bold">Doctor Advice & Prescriptions:</strong>
                    <p>{apt.prescriptionGiven}</p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    {canCancel && (
                      <button
                        onClick={() => cancelMutation.mutate(apt._id)}
                        disabled={cancelMutation.isPending}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                      >
                        Cancel Appointment
                      </button>
                    )}
                  </div>

                  {isVideo && apt.status === 'CONFIRMED' && apt.meetingLink && (
                    <a
                      href={apt.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Telehealth Visit
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
