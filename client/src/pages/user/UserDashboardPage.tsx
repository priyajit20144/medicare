import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  FileText,
  Calendar,
  Activity,
  Crown,
  ArrowRight,
  Upload,
  Plus,
  Clock,
  Video,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['userDashboardSummary'],
    queryFn: () => api.get<any>('/user/dashboard-summary'),
  });

  if (isLoading) {
    return <LoadingState message="Loading your patient healthcare dashboard..." />;
  }

  const metrics = summaryData?.metrics || {};
  const recentOrders = summaryData?.recentOrders || [];
  const upcomingAppointments = summaryData?.upcomingAppointments || [];
  const recentPrescriptions = summaryData?.recentPrescriptions || [];
  const activeMembership = summaryData?.activeMembership;
  const upcomingCheckups = summaryData?.upcomingCheckups || [];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Here is your health ecosystem overview, appointments, and medication fulfillments.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/prescriptions/upload"
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" /> Upload Rx
          </Link>
          <Link
            to="/doctors"
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5" /> Book Doctor
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.activeOrders || 0}</div>
          <p className="text-[11px] text-slate-400">{metrics.totalOrders || 0} total lifetime</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Prescriptions</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.totalPrescriptions || 0}</div>
          <p className="text-[11px] text-slate-400">
            {metrics.pendingPrescriptions || 0} pending review
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Consultations</span>
            <Calendar className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.upcomingAppointmentsCount || 0}
          </div>
          <p className="text-[11px] text-slate-400">Upcoming visits</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">VIP Status</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.hasActiveMembership ? 'ACTIVE' : 'FREE'}
          </div>
          <p className="text-[11px] text-slate-400">
            {metrics.hasActiveMembership
              ? `${metrics.membershipDaysRemaining} days remaining`
              : 'Upgrade to VIP Care'}
          </p>
        </div>
      </div>

      {/* Grid: Upcoming Appointments & Active Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Upcoming Consultations
            </h2>
            <Link to="/user/appointments" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No upcoming appointments scheduled.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt: any) => (
                <div
                  key={apt._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={apt.doctorId?.avatar || 'https://images.unsplash.com/photo-1594824813511-19d452093e9a?auto=format&fit=crop&q=80&w=150'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{apt.doctorId?.name}</h4>
                      <p className="text-[11px] text-slate-500">{apt.doctorId?.specialization}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {apt.date} at {apt.timeSlot} ({apt.consultationType})
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <StatusBadge status={apt.status} size="sm" />
                    {apt.meetingLink && apt.consultationType === 'VIDEO' && (
                      <a
                        href={apt.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                      >
                        <Video className="w-3 h-3" /> Join Room
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> Recent Pharmacy Orders
            </h2>
            <Link to="/user/orders" className="text-xs font-semibold text-emerald-600 hover:underline">
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No orders placed yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord: any) => (
                <Link
                  key={ord._id}
                  to={`/user/orders/${ord._id}`}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs hover:bg-slate-100/70 transition block"
                >
                  <div>
                    <span className="font-bold text-slate-900 block">{ord.orderNumber}</span>
                    <span className="text-[11px] text-slate-400">
                      {ord.items?.length || 0} items • ${ord.total?.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right">
                    <StatusBadge status={ord.status} size="sm" />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Prescriptions Preview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" /> Recent Prescriptions
          </h2>
          <Link to="/user/prescriptions" className="text-xs font-semibold text-emerald-600 hover:underline">
            View All
          </Link>
        </div>

        {recentPrescriptions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No prescriptions uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentPrescriptions.map((rx: any) => (
              <Link
                key={rx._id}
                to={`/user/prescriptions/${rx._id}`}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-slate-100/80 transition text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">
                    Patient: {rx.patientName}
                  </span>
                  <StatusBadge status={rx.status} size="sm" />
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  Doctor: {rx.doctorName || 'Not specified'}
                </p>
                <span className="text-[10px] text-slate-400 block">
                  {rx.files?.length || 0} file(s) attached
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
