import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Crown,
  Activity,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  Calendar,
  ShieldCheck,
  UserCheck,
  Sparkles,
  DollarSign,
  Clock,
  Home,
  Building2,
  AlertCircle,
  FileText,
  User,
  Truck,
  Video,
  X,
  Edit3,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../api/client';
import {
  UserMembership,
  HealthCheckupBooking,
  MembershipPlan,
  MembershipAdminStats,
} from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminPremiumCheckupsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Tab & Filters state
  const [activeTab, setActiveTab] = useState<'members' | 'bookings' | 'plans'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [quotaFilter, setQuotaFilter] = useState('ALL');
  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');

  // Modal States
  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [grantUserId, setGrantUserId] = useState('');
  const [grantPlanId, setGrantPlanId] = useState('');
  const [grantMonths, setGrantMonths] = useState(12);
  const [grantNotes, setGrantNotes] = useState('');

  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [targetMember, setTargetMember] = useState<UserMembership | null>(null);
  const [newUsedCount, setNewUsedCount] = useState<number>(0);
  const [newMaxLimit, setNewMaxLimit] = useState<number>(1);
  const [quotaReason, setQuotaReason] = useState<string>('');

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('ACTIVE');
  const [extendMonths, setExtendMonths] = useState<number>(0);
  const [statusNotes, setStatusNotes] = useState<string>('');

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState<HealthCheckupBooking | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string>('CONFIRMED');
  const [sampleStatus, setSampleStatus] = useState<string>('PENDING_COLLECTION');
  const [phlebotomistName, setPhlebotomistName] = useState<string>('');
  const [adminBookingNotes, setAdminBookingNotes] = useState<string>('');

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [planPrice, setPlanPrice] = useState<number>(149);
  const [planDiscountPrice, setPlanDiscountPrice] = useState<number | undefined>(undefined);
  const [planDuration, setPlanDuration] = useState<number>(12);
  const [planCheckupLimit, setPlanCheckupLimit] = useState<number>(1);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['membershipAdminStats'],
    queryFn: () => api.get<MembershipAdminStats>('/membership/admin/stats'),
  });

  const { data: memberships, isLoading: memLoading } = useQuery({
    queryKey: ['allMembershipsAdmin'],
    queryFn: () => api.get<UserMembership[]>('/membership/admin/all'),
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['adminAllCheckupBookings'],
    queryFn: () => api.get<HealthCheckupBooking[]>('/health-checkups/admin/bookings'),
  });

  const { data: plans } = useQuery({
    queryKey: ['membershipPlans'],
    queryFn: () => api.get<MembershipPlan[]>('/membership/plans'),
  });

  const { data: usersData } = useQuery({
    queryKey: ['adminUsersListCompact'],
    queryFn: () => api.get<{ users: any[] }>('/admin/users?limit=100'),
  });

  const isLoading = statsLoading || memLoading || bookingsLoading;

  // Mutations
  const grantMembershipMutation = useMutation({
    mutationFn: (body: any) => api.post('/membership/admin/grant', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMembershipsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['membershipAdminStats'] });
      setGrantModalOpen(false);
      setGrantUserId('');
      setGrantNotes('');
      showSuccess('Complimentary VIP Membership granted successfully!');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Could not grant VIP membership.');
    },
  });

  const adjustQuotaMutation = useMutation({
    mutationFn: (vars: { id: string; usedCount: number; maxLimit: number; reason: string }) =>
      api.patch(`/membership/admin/${vars.id}/benefits`, {
        benefitKey: 'free_annual_checkup',
        usedCount: vars.usedCount,
        maxLimit: vars.maxLimit,
        reason: vars.reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMembershipsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['membershipAdminStats'] });
      setQuotaModalOpen(false);
      setTargetMember(null);
      showSuccess('VIP Annual Checkup quota adjusted successfully!');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Could not adjust checkup quota.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { id: string; status: string; extendMonths?: number; notes?: string }) =>
      api.patch(`/membership/admin/${vars.id}/status`, {
        status: vars.status,
        extendMonths: vars.extendMonths,
        notes: vars.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMembershipsAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['membershipAdminStats'] });
      setStatusModalOpen(false);
      setTargetMember(null);
      showSuccess('Membership status and coverage extended successfully!');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Could not update membership status.');
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: (vars: {
      id: string;
      status: string;
      sampleStatus: string;
      phlebotomistName?: string;
      notes?: string;
    }) =>
      api.patch(`/health-checkups/admin/bookings/${vars.id}`, {
        status: vars.status,
        sampleStatus: vars.sampleStatus,
        phlebotomistName: vars.phlebotomistName,
        notes: vars.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllCheckupBookings'] });
      queryClient.invalidateQueries({ queryKey: ['membershipAdminStats'] });
      setBookingModalOpen(false);
      setTargetBooking(null);
      showSuccess('Health checkup booking status and phlebotomy updated!');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Could not update checkup booking.');
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: (vars: { id: string; body: any }) =>
      api.patch(`/membership/admin/plans/${vars.id}`, vars.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membershipPlans'] });
      setPlanModalOpen(false);
      showSuccess('Membership Plan & Checkup parameters updated successfully!');
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Could not update plan configuration.');
    },
  });

  // Handlers
  const handleOpenQuotaModal = (m: UserMembership) => {
    setTargetMember(m);
    const benefit = m.benefitUsages?.find(
      (b) => b.benefitKey === 'free_annual_checkup' || b.benefitKey.includes('checkup')
    );
    setNewUsedCount(benefit?.usedCount ?? 0);
    setNewMaxLimit(benefit?.maxLimit ?? 1);
    setQuotaReason('');
    setQuotaModalOpen(true);
  };

  const handleOpenStatusModal = (m: UserMembership) => {
    setTargetMember(m);
    setNewStatus(m.status);
    setExtendMonths(0);
    setStatusNotes('');
    setStatusModalOpen(true);
  };

  const handleOpenBookingModal = (b: HealthCheckupBooking) => {
    setTargetBooking(b);
    setBookingStatus(b.status);
    setSampleStatus(b.sampleStatus || 'PENDING_COLLECTION');
    setPhlebotomistName(b.phlebotomistName || '');
    setAdminBookingNotes(b.notes || '');
    setBookingModalOpen(true);
  };

  const handleOpenPlanModal = (p: MembershipPlan) => {
    setEditingPlan(p);
    setPlanPrice(p.price);
    setPlanDiscountPrice(p.discountPrice);
    setPlanDuration(p.durationMonths);
    const checkupCfg = p.benefitsConfig?.find(
      (b) => b.key === 'free_annual_checkup' || b.key.includes('checkup')
    );
    setPlanCheckupLimit(checkupCfg?.maxLimit ?? 1);
    setPlanModalOpen(true);
  };

  const handleSavePlan = () => {
    if (!editingPlan) return;
    const updatedBenefits = (editingPlan.benefitsConfig || []).map((b) => {
      if (b.key === 'free_annual_checkup' || b.key.includes('checkup')) {
        return { ...b, maxLimit: Number(planCheckupLimit) };
      }
      return b;
    });

    updatePlanMutation.mutate({
      id: editingPlan._id,
      body: {
        price: Number(planPrice),
        discountPrice: planDiscountPrice ? Number(planDiscountPrice) : undefined,
        durationMonths: Number(planDuration),
        benefitsConfig: updatedBenefits,
      },
    });
  };

  // Filtered lists
  const filteredMembers = (memberships || []).filter((m) => {
    const term = searchTerm.toLowerCase();
    const name = m.userId?.fullName?.toLowerCase() || '';
    const email = m.userId?.email?.toLowerCase() || '';
    const memId = m.membershipId?.toLowerCase() || '';
    const matchesSearch = name.includes(term) || email.includes(term) || memId.includes(term);

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    const checkupBenefit = m.benefitUsages?.find(
      (b) => b.benefitKey === 'free_annual_checkup' || b.benefitKey.includes('checkup')
    );
    const used = checkupBenefit?.usedCount ?? 0;
    const max = checkupBenefit?.maxLimit ?? 1;
    const hasRemaining = used < max;

    const matchesQuota =
      quotaFilter === 'ALL' ||
      (quotaFilter === 'AVAILABLE' && hasRemaining) ||
      (quotaFilter === 'CLAIMED' && !hasRemaining);

    return matchesSearch && matchesStatus && matchesQuota;
  });

  const filteredBookings = (bookings || []).filter((b) => {
    const term = searchTerm.toLowerCase();
    const patientName = b.patientName?.toLowerCase() || '';
    const bookingNumber = b.bookingNumber?.toLowerCase() || '';
    const packageName = b.packageId?.name?.toLowerCase() || '';
    const matchesSearch =
      patientName.includes(term) || bookingNumber.includes(term) || packageName.includes(term);

    const matchesType =
      bookingFilter === 'ALL' ||
      (bookingFilter === 'VIP_ONLY' && (b.isVipRedemption || b.vipMembershipId)) ||
      (bookingFilter === 'HOME_COLLECTION' && b.sampleCollectionType === 'HOME_COLLECTION') ||
      (bookingFilter === 'AT_CENTER' && b.sampleCollectionType === 'AT_CENTER');

    const matchesStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (isLoading) {
    return (
      <LoadingState
        message="Loading Premium VIP Health Checkup Administration Console..."
        minHeight="min-h-[60vh]"
      />
    );
  }

  const primaryPlan = plans?.[0];

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
            <Crown className="w-3.5 h-3.5" />
            <span>VIP Health Services Control Tower</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Premium VIP Health Checkup Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Oversee VIP annual executive checkup quotas, manage complimentary vouchers, track phlebotomy specimen dispatch, and administer membership privileges.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['allMembershipsAdmin'] });
              queryClient.invalidateQueries({ queryKey: ['membershipAdminStats'] });
              queryClient.invalidateQueries({ queryKey: ['adminAllCheckupBookings'] });
            }}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-xs text-xs flex items-center gap-2"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {primaryPlan && (
            <button
              onClick={() => handleOpenPlanModal(primaryPlan)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center gap-2"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Configure VIP Plan</span>
            </button>
          )}

          <button
            id="admin-grant-vip-btn"
            onClick={() => {
              setGrantPlanId(primaryPlan?._id || '');
              setGrantModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Grant VIP Membership</span>
          </button>
        </div>
      </div>

      {/* Toast Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs rounded-2xl flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-950/60 border border-rose-500 text-rose-300 text-xs rounded-2xl flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active VIP Members */}
        <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active VIP Members</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalActive || 0}</div>
          <p className="text-xs text-amber-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> {stats?.totalMemberships || 0} total enrolled
          </p>
        </div>

        {/* Annual Checkup Quotas */}
        <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Annual Checkups Quota
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">
              {stats?.checkupBenefits?.totalAvailable ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              of {stats?.checkupBenefits?.totalAllocated ?? 0} available
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{
                width: `${
                  stats?.checkupBenefits?.totalAllocated
                    ? (
                        ((stats.checkupBenefits.totalClaimed || 0) /
                          stats.checkupBenefits.totalAllocated) *
                        100
                      ).toFixed(0)
                    : 0
                }%`,
              }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {stats?.checkupBenefits?.totalClaimed ?? 0} claimed vouchers redeemed
          </p>
        </div>

        {/* VIP Checkup Bookings */}
        <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              VIP Checkup Bookings
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {stats?.vipCheckupBookingsCount ?? 0}
          </div>
          <p className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Free home collection included
          </p>
        </div>

        {/* Total Premium Tier Revenue */}
        <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              VIP Subscription Ledger
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            ${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
          </div>
          <p className="text-xs text-purple-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Annual VIP recurring value
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'members'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>VIP Members & Checkup Quotas ({memberships?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'bookings'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Health Checkup Bookings & Phlebotomy ({bookings?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition ${
            activeTab === 'plans'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Membership Plan & Benefit Rules</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={
              activeTab === 'members'
                ? 'Search VIP members by name, email, or Membership ID...'
                : 'Search checkup bookings by patient, ID, or package...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {activeTab === 'members' && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active Only</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={quotaFilter}
              onChange={(e) => setQuotaFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Checkup Quota: All</option>
              <option value="AVAILABLE">Voucher Available (0/1)</option>
              <option value="CLAIMED">Voucher Claimed (1/1)</option>
            </select>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Booking Types</option>
              <option value="VIP_ONLY">VIP Members & Redemptions Only</option>
              <option value="HOME_COLLECTION">Home Phlebotomy Visits</option>
              <option value="AT_CENTER">Center Diagnostics</option>
            </select>

            <select
              value={bookingStatusFilter}
              onChange={(e) => setBookingStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Status: All</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: VIP Members & Checkup Quotas */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-sm overflow-hidden text-xs">
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              <table className="w-full text-left min-w-[760px]">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">VIP Member & Contact</th>
                    <th className="p-4">Membership ID & Tier</th>
                    <th className="p-4">Annual Checkup Allowance</th>
                    <th className="p-4">Coverage Timeline</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No VIP members match your search filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const checkupBenefit = m.benefitUsages?.find(
                        (b) =>
                          b.benefitKey === 'free_annual_checkup' ||
                          b.benefitKey.includes('checkup')
                      );
                      const used = checkupBenefit?.usedCount ?? 0;
                      const max = checkupBenefit?.maxLimit ?? 1;
                      const isClaimed = used >= max;
                      const remaining = Math.max(0, max - used);

                      const isExpired = new Date(m.endDate) < new Date();
                      const daysRemaining = Math.max(
                        0,
                        Math.ceil(
                          (new Date(m.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                        )
                      );

                      return (
                        <tr
                          key={m._id}
                          className="hover:bg-slate-900/40 transition-colors items-center"
                        >
                          {/* Member Info */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-xs shadow-xs flex-shrink-0">
                                {m.userId?.fullName?.charAt(0) || 'U'}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-white block truncate">
                                  {m.userId?.fullName || 'VIP Patient'}
                                </span>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  {m.userId?.email || 'N/A'}
                                </span>
                                {m.userId?.phone && (
                                  <span className="text-[10px] text-slate-500 block">
                                    {m.userId.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* ID & Tier */}
                          <td className="p-4">
                            <span className="font-mono font-bold text-amber-400 block">
                              {m.membershipId}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {m.planId?.name || '1-Year Annual Tier'}
                            </span>
                          </td>

                          {/* Checkup Allowance */}
                          <td className="p-4">
                            <div className="space-y-1.5 max-w-[180px]">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-300 font-semibold">
                                  {used} of {max} Claimed
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    !isClaimed
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                  }`}
                                >
                                  {!isClaimed ? `${remaining} Available` : 'Redeemed'}
                                </span>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isClaimed ? 'bg-purple-400' : 'bg-emerald-400'
                                  }`}
                                  style={{
                                    width: `${Math.min(100, (used / max) * 100)}%`,
                                  }}
                                />
                              </div>
                              {checkupBenefit?.lastUsedAt && (
                                <span className="text-[10px] text-slate-500 block">
                                  Last redeemed: {new Date(checkupBenefit.lastUsedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Validity */}
                          <td className="p-4">
                            <div className="text-[11px] text-slate-300">
                              <span className="block">
                                Valid to: <strong className="text-white">{new Date(m.endDate).toLocaleDateString()}</strong>
                              </span>
                              <span
                                className={`text-[10px] font-semibold ${
                                  isExpired ? 'text-rose-400' : 'text-slate-400'
                                }`}
                              >
                                {isExpired ? 'Coverage Expired' : `${daysRemaining} days active`}
                              </span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                m.status === 'ACTIVE' && !isExpired
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : m.status === 'SUSPENDED'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {isExpired && m.status === 'ACTIVE' ? 'EXPIRED' : m.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenQuotaModal(m)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] transition"
                                title="Adjust Annual Checkup Voucher Quota"
                              >
                                Quota ({remaining})
                              </button>
                              <button
                                onClick={() => handleOpenStatusModal(m)}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition border border-slate-700"
                                title="Change Status or Extend Coverage"
                              >
                                Manage
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIP & Priority Health Checkup Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-sm overflow-hidden text-xs">
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Booking & Tier</th>
                    <th className="p-4">Patient & Contact</th>
                    <th className="p-4">Checkup Package & Facility</th>
                    <th className="p-4">Date & Collection Mode</th>
                    <th className="p-4">Specimen Status</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No health checkup bookings match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const isVip = b.isVipRedemption || !!b.vipMembershipId;

                      return (
                        <tr
                          key={b._id}
                          className="hover:bg-slate-900/40 transition-colors items-center"
                        >
                          {/* Booking Number & VIP Badge */}
                          <td className="p-4">
                            <span className="font-mono font-bold text-white block">
                              {b.bookingNumber}
                            </span>
                            {isVip ? (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                                <Crown className="w-3 h-3" /> VIP Redeemed ($0)
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Standard Paid (${b.payment?.amount})
                              </span>
                            )}
                          </td>

                          {/* Patient */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="font-bold text-white block">{b.patientName}</span>
                              <span className="text-[11px] text-slate-400 block">
                                {b.patientAge} yrs • {b.patientGender}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {b.patientPhone}
                              </span>
                            </div>
                          </td>

                          {/* Package & Facility */}
                          <td className="p-4">
                            <div className="space-y-0.5 max-w-[200px]">
                              <span className="font-semibold text-slate-200 block truncate">
                                {b.packageId?.name || 'Comprehensive Health Checkup'}
                              </span>
                              <span className="text-[11px] text-emerald-400 block truncate">
                                🏥 {b.facilityId?.name || 'Central Diagnostic Center'}
                              </span>
                            </div>
                          </td>

                          {/* Date & Collection */}
                          <td className="p-4">
                            <div className="space-y-1">
                              <span className="text-white font-bold block flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" /> {b.bookingDate} ({b.timeSlot})
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  b.sampleCollectionType === 'HOME_COLLECTION'
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {b.sampleCollectionType === 'HOME_COLLECTION' ? (
                                  <>
                                    <Home className="w-3 h-3" /> Home Phlebotomy
                                  </>
                                ) : (
                                  <>
                                    <Building2 className="w-3 h-3" /> Diagnostic Center
                                  </>
                                )}
                              </span>
                              {b.homeAddress && (
                                <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                                  {b.homeAddress}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Sample Status */}
                          <td className="p-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  b.sampleStatus === 'COMPLETED'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : b.sampleStatus === 'SAMPLE_COLLECTED'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : b.sampleStatus === 'IN_LAB_ANALYSIS'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {b.sampleStatus?.replace(/_/g, ' ') || 'PENDING COLLECTION'}
                              </span>
                              {b.phlebotomistName && (
                                <span className="text-[10px] text-slate-400 block">
                                  Phlebotomist: <strong>{b.phlebotomistName}</strong>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Booking Status */}
                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                b.status === 'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : b.status === 'CONFIRMED'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                  : b.status === 'CANCELLED'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleOpenBookingModal(b)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition border border-slate-700"
                            >
                              Update Status
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Membership Plan Configuration */}
      {activeTab === 'plans' && primaryPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{primaryPlan.name}</h3>
                  <span className="text-[11px] text-slate-400">
                    Duration: {primaryPlan.durationMonths} Months ({primaryPlan.durationMonths * 30} Days)
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleOpenPlanModal(primaryPlan)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit Configuration
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-semibold">Standard Price</span>
                <span className="text-2xl font-black text-white">${primaryPlan.price}</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-semibold">Discounted Price</span>
                <span className="text-2xl font-black text-amber-400">
                  ${primaryPlan.discountPrice || primaryPlan.price}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Included VIP Membership Privileges
              </h4>
              <div className="space-y-2">
                {primaryPlan.features?.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              VIP Checkup Benefit Allocation Rules
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every patient who subscribes to Medicare VIP is immediately allocated diagnostic checkup vouchers according to these parameters. When redeemed, costs are fully covered at $0.00.
            </p>

            <div className="space-y-3">
              {primaryPlan.benefitsConfig?.map((b, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-white font-bold">{b.name}</strong>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                      Limit: {b.maxLimit ?? 1} / Member
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{b.description}</p>
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Frequency: {b.frequency}</span>
                    <span className="font-mono text-slate-400">Key: {b.key}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: Grant VIP Membership to User                   */}
      {/* ======================================================== */}
      {grantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 text-xs text-slate-200 animate-scaleUp shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Grant Complimentary VIP Membership
                </h3>
              </div>
              <button
                onClick={() => setGrantModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                grantMembershipMutation.mutate({
                  userId: grantUserId,
                  planId: grantPlanId || primaryPlan?._id,
                  durationMonths: Number(grantMonths),
                  notes: grantNotes,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">
                  Select Registered Patient
                </label>
                <select
                  required
                  value={grantUserId}
                  onChange={(e) => setGrantUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {usersData?.users?.map((u: any) => (
                    <option key={u._id} value={u._id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Membership Plan</label>
                  <select
                    value={grantPlanId}
                    onChange={(e) => setGrantPlanId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {plans?.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Duration</label>
                  <select
                    value={grantMonths}
                    onChange={(e) => setGrantMonths(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">
                  Administrative Grant Reason / Note
                </label>
                <textarea
                  rows={2}
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                  placeholder="e.g. Executive courtesy, corporate enrollment, clinical VIP package"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
                ⭐ Grants complete VIP privileges including 1 Free Comprehensive Health Checkup ($229 value), priority queues, and free express deliveries.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGrantModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantMembershipMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {grantMembershipMutation.isPending ? 'Granting...' : 'Grant VIP Care'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: Adjust Health Checkup Quota & Allowances       */}
      {/* ======================================================== */}
      {quotaModalOpen && targetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 text-xs text-slate-200 animate-scaleUp shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Adjust VIP Checkup Allowance
                </h3>
              </div>
              <button
                onClick={() => setQuotaModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Target Patient
              </span>
              <p className="font-bold text-white text-sm">
                {targetMember.userId?.fullName || 'VIP Patient'}
              </p>
              <p className="text-[11px] text-slate-400">{targetMember.membershipId}</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                adjustQuotaMutation.mutate({
                  id: targetMember._id,
                  usedCount: Number(newUsedCount),
                  maxLimit: Number(newMaxLimit),
                  reason: quotaReason,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Checkups Used (Count)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    required
                    value={newUsedCount}
                    onChange={(e) => setNewUsedCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Set to 0 to reset voucher
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Max Limit (Quota)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={newMaxLimit}
                    onChange={(e) => setNewMaxLimit(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Increase to grant extra checkups
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Reason for Adjustment</label>
                <input
                  type="text"
                  value={quotaReason}
                  onChange={(e) => setQuotaReason(e.target.value)}
                  placeholder="e.g. Rescheduled test, promotional bonus, lab repeat"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuotaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustQuotaMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {adjustQuotaMutation.isPending ? 'Updating...' : 'Save Allowance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: Update Membership Status & Extend Validity     */}
      {/* ======================================================== */}
      {statusModalOpen && targetMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 text-xs text-slate-200 animate-scaleUp shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Manage Membership & Validity
                </h3>
              </div>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateStatusMutation.mutate({
                  id: targetMember._id,
                  status: newStatus,
                  extendMonths: Number(extendMonths),
                  notes: statusNotes,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Membership Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                >
                  <option value="ACTIVE">ACTIVE (Full Privileges)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporarily Paused)</option>
                  <option value="CANCELLED">CANCELLED (Terminated)</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">
                  Extend Coverage Duration
                </label>
                <select
                  value={extendMonths}
                  onChange={(e) => setExtendMonths(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={0}>Do Not Extend (+0 Months)</option>
                  <option value={1}>+1 Month Extension</option>
                  <option value={3}>+3 Months Extension</option>
                  <option value={6}>+6 Months Extension</option>
                  <option value={12}>+12 Months (1 Full Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Admin Note</label>
                <input
                  type="text"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Courtesy renewal granted"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {updateStatusMutation.isPending ? 'Saving...' : 'Update Membership'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: Update Checkup Booking & Phlebotomy Specimen    */}
      {/* ======================================================== */}
      {bookingModalOpen && targetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 text-xs text-slate-200 animate-scaleUp shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Update Checkup & Phlebotomy Status
                </h3>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400">
                  {targetBooking.bookingNumber}
                </span>
                <span className="text-[11px] text-slate-400">
                  {targetBooking.bookingDate} ({targetBooking.timeSlot})
                </span>
              </div>
              <p className="font-bold text-white">{targetBooking.patientName}</p>
              <p className="text-[11px] text-emerald-400">
                {targetBooking.packageId?.name || 'Diagnostic Package'}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateBookingMutation.mutate({
                  id: targetBooking._id,
                  status: bookingStatus,
                  sampleStatus,
                  phlebotomistName,
                  notes: adminBookingNotes,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Booking Status</label>
                  <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="RESCHEDULE_REQUESTED">RESCHEDULE REQUESTED</option>
                    <option value="PENDING_PAYMENT">PENDING PAYMENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Specimen / Sample Status</label>
                  <select
                    value={sampleStatus}
                    onChange={(e) => setSampleStatus(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="PENDING_COLLECTION">PENDING COLLECTION</option>
                    <option value="SAMPLE_COLLECTED">SAMPLE COLLECTED</option>
                    <option value="IN_LAB_ANALYSIS">IN LAB ANALYSIS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">
                  Assigned Phlebotomist / Nurse
                </label>
                <input
                  type="text"
                  value={phlebotomistName}
                  onChange={(e) => setPhlebotomistName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins (Licensed Phlebotomist)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Lab / Processing Notes</label>
                <textarea
                  rows={2}
                  value={adminBookingNotes}
                  onChange={(e) => setAdminBookingNotes(e.target.value)}
                  placeholder="Specimen handling notes, collection observations..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateBookingMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {updateBookingMutation.isPending ? 'Updating...' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: Configure Membership Plan & Pricing            */}
      {/* ======================================================== */}
      {planModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 text-xs text-slate-200 animate-scaleUp shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Configure VIP Membership Plan</h3>
              </div>
              <button
                onClick={() => setPlanModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Standard Price ($)</label>
                <input
                  type="number"
                  min={0}
                  value={planPrice}
                  onChange={(e) => setPlanPrice(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Discount Price ($)</label>
                <input
                  type="number"
                  min={0}
                  value={planDiscountPrice ?? ''}
                  onChange={(e) =>
                    setPlanDiscountPrice(e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder="Optional promotional price"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Duration (Months)</label>
                  <input
                    type="number"
                    min={1}
                    value={planDuration}
                    onChange={(e) => setPlanDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">
                    Annual Checkup Quota
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={planCheckupLimit}
                    onChange={(e) => setPlanCheckupLimit(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePlan}
                  disabled={updatePlanMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {updatePlanMutation.isPending ? 'Saving...' : 'Save Plan Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPremiumCheckupsPage;
