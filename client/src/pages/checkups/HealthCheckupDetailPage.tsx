import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Clock,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Home,
  Crown,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';
import { HealthCheckupPackage, Facility } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { LoadingState } from '../../components/common/LoadingState';

export const HealthCheckupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [selectedFacilityId, setSelectedFacilityId] = useState('');
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('08:00 AM');
  const [sampleCollectionType, setSampleCollectionType] = useState<'AT_CENTER' | 'HOME_COLLECTION'>('AT_CENTER');
  const [homeAddress, setHomeAddress] = useState('');
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientAge, setPatientAge] = useState('32');
  const [patientGender, setPatientGender] = useState('FEMALE');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [redeemVipBenefit, setRedeemVipBenefit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch package details
  const { data: pkg, isLoading } = useQuery({
    queryKey: ['checkupPackage', id],
    queryFn: () => api.get<HealthCheckupPackage>(`/health-checkups/packages/${id}`),
    enabled: !!id,
  });

  // Fetch facilities
  const { data: facilities } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => api.get<Facility[]>('/facilities'),
  });

  // Fetch active VIP membership if logged in
  const { data: memData } = useQuery({
    queryKey: ['myCurrentMembership'],
    queryFn: () =>
      api.get<{ hasActiveMembership: boolean; membership: any; daysRemaining: number }>(
        '/membership/me'
      ),
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return <LoadingState message="Loading checkup diagnostic panel..." minHeight="min-h-[60vh]" />;
  }

  if (!pkg) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Package Not Found</h2>
        <Link
          to="/health-checkups"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Packages
        </Link>
      </div>
    );
  }

  const defaultFacility = facilities?.[0];
  const activeFacilityId = selectedFacilityId || defaultFacility?._id || '';

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate(`/login?returnUrl=/health-checkups/${pkg._id}`);
      return;
    }

    if (!activeFacilityId) {
      setError('Please select a healthcare facility for sample processing.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/health-checkups/bookings', {
        packageId: pkg._id,
        facilityId: activeFacilityId,
        patientName,
        patientAge: Number(patientAge),
        patientGender,
        patientPhone,
        patientEmail,
        bookingDate,
        timeSlot,
        sampleCollectionType,
        homeAddress: sampleCollectionType === 'HOME_COLLECTION' ? homeAddress : undefined,
        notes,
        redeemVipBenefit,
      });

      navigate('/user/health-checkups?booked=true');
    } catch (err: any) {
      setError(err.message || 'Could not schedule booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasActiveVip = memData?.hasActiveMembership;
  const checkupBenefit = memData?.membership?.benefitUsages?.find(
    (b: any) => b.benefitKey === 'free_annual_checkup' || b.benefitKey.includes('checkup')
  );
  const freeCheckupAvailable =
    hasActiveVip &&
    checkupBenefit &&
    (checkupBenefit.maxLimit === undefined || checkupBenefit.usedCount < checkupBenefit.maxLimit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/health-checkups" className="hover:text-emerald-600">Health Checkups</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{pkg.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Package Monograph & Included Tests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 text-xs font-bold">
                {pkg.testCount} Comprehensive Diagnostic Tests
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Clock className="w-3.5 h-3.5 text-cyan-600" /> Fast Turnaround ({pkg.duration})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {pkg.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {pkg.description}
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
              <strong className="block text-slate-900 mb-1">Pre-Test Preparation Guidelines:</strong>
              10 to 12 hours of overnight fasting is mandatory prior to blood draw for accurate blood glucose and lipid measurements. Water intake is permitted.
            </div>
          </div>

          {/* List of included tests */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Clinical Tests Included in this Screening ({pkg.includedTests?.length || pkg.testCount})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.includedTests?.map((test: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{test.name || test}</span>
                    <span className="text-[10px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded">
                      {test.category || 'Pathology'}
                    </span>
                  </div>
                  {test.sampleType && (
                    <span className="text-[10px] text-slate-400 block">
                      Sample: {test.sampleType}
                    </span>
                  )}
                  {test.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2">{test.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Facility Selection & Scheduling Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Book Checkup Appointment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your diagnostic center and select a morning slot.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleBooking} className="space-y-4 text-xs">
            {/* Facility Choice */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Processing Facility</label>
              <select
                value={activeFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {facilities?.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Collection Type */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sample Collection Mode</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSampleCollectionType('AT_CENTER')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                    sampleCollectionType === 'AT_CENTER'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> At Diagnostic Center
                </button>
                <button
                  type="button"
                  onClick={() => setSampleCollectionType('HOME_COLLECTION')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                    sampleCollectionType === 'HOME_COLLECTION'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" /> Home Phlebotomy
                </button>
              </div>
            </div>

            {sampleCollectionType === 'HOME_COLLECTION' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Home Collection Address</label>
                <input
                  type="text"
                  required
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  placeholder="Street address for phlebotomist visit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Date & Slot */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Morning Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="07:00 AM">07:00 AM</option>
                  <option value="07:30 AM">07:30 AM</option>
                  <option value="08:00 AM">08:00 AM</option>
                  <option value="08:30 AM">08:30 AM</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                </select>
              </div>
            </div>

            {/* Patient Info */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* VIP Annual Checkup Voucher Card */}
            {freeCheckupAvailable && (
              <div className="p-3.5 bg-gradient-to-tr from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="font-extrabold text-amber-900 text-xs">
                      Medicare VIP Annual Checkup Voucher
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase">
                    100% Covered
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Your VIP membership includes this comprehensive screening with $0 out-of-pocket charges.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer font-bold text-amber-950 text-xs select-none">
                  <input
                    type="checkbox"
                    checked={redeemVipBenefit}
                    onChange={(e) => setRedeemVipBenefit(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
                  />
                  <span>Redeem Annual VIP Voucher ($0.00 Total Due)</span>
                </label>
              </div>
            )}

            {/* Total Price & Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Due</span>
                {redeemVipBenefit ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-600">$0.00</span>
                    <span className="text-xs text-slate-400 line-through">
                      ${pkg.discountPrice || pkg.price}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      VIP Covered
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-slate-900">
                    ${pkg.discountPrice || pkg.price}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 disabled:opacity-50"
              >
                {submitting ? 'Booking...' : redeemVipBenefit ? 'Claim Free Checkup' : 'Confirm Checkup'}{' '}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
