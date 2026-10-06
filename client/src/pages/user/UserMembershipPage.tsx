import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Crown,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Zap,
} from 'lucide-react';
import { api } from '../../api/client';
import { UserMembership } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';

export const UserMembershipPage: React.FC = () => {
  const { data: memData, isLoading } = useQuery({
    queryKey: ['myCurrentMembership'],
    queryFn: () => api.get<{ hasActiveMembership: boolean; membership: UserMembership; daysRemaining: number }>('/membership/me'),
  });

  if (isLoading) {
    return <LoadingState message="Loading membership status..." minHeight="min-h-[50vh]" />;
  }

  const hasActive = memData?.hasActiveMembership;
  const membership = memData?.membership;
  const daysRemaining = memData?.daysRemaining || 0;

  if (!hasActive || !membership) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-6 max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <Crown className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Upgrade to Medicare VIP 1-Year Care
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            You are currently on our Standard Free Tier. Upgrade to receive an annual executive checkup ($229 value), priority zero-wait doctor appointments, and unlimited free medicine delivery.
          </p>
        </div>

        <Link
          to="/premium"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition"
        >
          Explore VIP Benefits & Subscribe <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Medicare VIP Healthcare Membership
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your annual healthcare privileges, tracked allowances, and coverage timeline.
        </p>
      </div>

      {/* Gold VIP Card */}
      <div className="bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/20 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-100">
                VIP Membership Card
              </span>
              <h2 className="text-xl font-extrabold text-white">
                {membership.planId?.name || 'Medicare Premium — 1 Year'}
              </h2>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-amber-100 uppercase tracking-wider block">ID Number</span>
            <span className="text-base font-black tracking-widest text-white">
              {membership.membershipId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-amber-100">
          <div>
            <span className="block text-[11px] text-amber-200">Start Date</span>
            <strong className="text-white font-bold">
              {new Date(membership.startDate).toLocaleDateString()}
            </strong>
          </div>
          <div>
            <span className="block text-[11px] text-amber-200">Expiration Date</span>
            <strong className="text-white font-bold">
              {new Date(membership.endDate).toLocaleDateString()}
            </strong>
          </div>
          <div>
            <span className="block text-[11px] text-amber-200">Days Remaining</span>
            <strong className="text-white font-black text-sm">{daysRemaining} Days</strong>
          </div>
          <div>
            <span className="block text-[11px] text-amber-200">Status</span>
            <span className="px-2 py-0.5 rounded-md bg-white/20 font-bold text-white text-[11px]">
              {membership.status}
            </span>
          </div>
        </div>
      </div>

      {/* Benefit Usage Tracking */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Your Tracked Membership Allowances
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor and redeem your included clinical benefits throughout the 1-year coverage period.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {membership.benefitUsages?.map((b, idx) => {
            const hasLimit = b.maxLimit !== undefined;
            const remaining = hasLimit ? Math.max(0, b.maxLimit! - b.usedCount) : 'Unlimited';

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900">{b.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                    {hasLimit ? `${b.usedCount} of ${b.maxLimit} used` : 'Unlimited Usage'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>Remaining Allowance:</span>
                  <strong className="text-slate-800">{remaining}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
