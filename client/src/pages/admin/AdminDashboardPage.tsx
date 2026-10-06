import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Pill,
  Calendar,
  FileCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Mail,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';

export const AdminDashboardPage: React.FC = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['adminAnalyticsOverview'],
    queryFn: () => api.get<any>('/admin/analytics/overview'),
  });

  if (isLoading) {
    return <LoadingState message="Loading administrative intelligence metrics..." minHeight="min-h-[60vh]" />;
  }

  const metrics = analyticsData?.metrics || {};
  const ordersByStatus = analyticsData?.ordersByStatus || [];
  const topMedicines = analyticsData?.topMedicines || [];
  const topDoctors = analyticsData?.topDoctors || [];
  const recentOrders = analyticsData?.recentOrders || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Gross Pharmacy Revenue</span>
            <DollarSign className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ${metrics.totalRevenue?.toFixed(2) || '0.00'}
          </div>
          <p className="text-[11px] sm:text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 100% Verified Ledger
          </p>
        </div>

        <div className="p-4 sm:p-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{metrics.totalOrders || 0}</div>
          <p className="text-[11px] sm:text-xs text-slate-400">{metrics.pendingOrders || 0} pending fulfillment</p>
        </div>

        <div className="p-4 sm:p-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Prescriptions In Review</span>
            <FileCheck className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{metrics.pendingPrescriptions || 0}</div>
          <p className="text-[11px] sm:text-xs text-slate-400">{metrics.totalPrescriptions || 0} total uploaded</p>
        </div>

        <div className="p-4 sm:p-6 bg-slate-950 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">Registered Patients</span>
            <Users className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{metrics.totalUsers || 0}</div>
          <p className="text-[11px] sm:text-xs text-purple-400 font-semibold truncate">
            {metrics.totalDoctors || 0} Doctors • {metrics.totalPharmacists || 0} Pharmacists
          </p>
        </div>
      </div>

      {/* Grid: Order Distribution & Top Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Order Status Breakdown */}
        <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Order Pipeline Status Breakdown
          </h3>
          <div className="space-y-2.5 pt-2">
            {ordersByStatus.map((item: any) => (
              <div key={item._id} className="flex items-center justify-between text-xs p-1">
                <span className="text-slate-300 font-medium">{item._id?.replace(/_/g, ' ')}</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 font-bold text-white">
                  {item.count} Orders
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Medications */}
        <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Top Catalog Medicines
            </h3>
            <Link to="/admin/medicines" className="text-xs font-semibold text-emerald-400 hover:underline">
              Inventory Manager →
            </Link>
          </div>

          <div className="space-y-2.5 pt-2">
            {topMedicines.map((m: any) => (
              <div key={m._id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white truncate">{m.name}</h4>
                  <span className="text-slate-400 text-[11px] truncate block">{m.brand} • Stock: {m.stock}</span>
                </div>
                <span className="font-black text-emerald-400 text-sm flex-shrink-0">${m.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Recent System Orders
          </h3>
          <Link to="/admin/orders" className="text-xs font-semibold text-emerald-400 hover:underline">
            Manage All Orders →
          </Link>
        </div>

        <div className="divide-y divide-slate-800 text-xs">
          {recentOrders.map((ord: any) => (
            <div key={ord._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <span className="font-extrabold text-white block">{ord.orderNumber}</span>
                <span className="text-slate-400 text-[11px] truncate block">
                  Customer: {ord.userId?.fullName || 'Patient'} ({ord.userId?.email})
                </span>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t border-slate-800/40 sm:border-none">
                <StatusBadge status={ord.status} size="sm" />
                <span className="font-bold text-white text-sm">${ord.total?.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Email & SMTP Notification Center (20 Core Triggers) */}
      <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex flex-wrap items-center gap-2">
                Automated Email Notification Engine
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mailofly API Active
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                20 Core Transactional Triggers Active · Patient Care & Audit Lifecycle
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="truncate">Dual Delivery Engine (HTTP REST & SMTP Relay)</span>
          </div>
        </div>

        {/* 20 Triggers Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 pt-1 text-xs">
          {[
            'Account Verification',
            'Welcome Email',
            'Password Reset',
            'Password Changed',
            'Security Alert',
            'Order Confirmation',
            'Order Status Update',
            'Prescription Uploaded',
            'Prescription Approved',
            'Prescription Rejected',
            'Clarification Needed',
            'Appointment Booked',
            'Appointment Status',
            'Appointment Reminder',
            'Appointment Cancelled',
            'VIP Membership',
            'Membership Expiring',
            'Checkup Booking',
            'Checkup Reminder',
            'Lab Report Ready',
          ].map((trigger, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 text-[11px] min-w-0 overflow-hidden">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
              <span className="truncate">{trigger}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
