import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Star,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../../api/client';
import { Doctor } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { LoadingState } from '../../components/common/LoadingState';

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState<'VIDEO' | 'IN_PERSON'>('VIDEO');
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientAge, setPatientAge] = useState('30');
  const [patientGender, setPatientGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch doctor profile
  const { data: doctor, isLoading, isError } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api.get<Doctor>(`/doctors/${id}`),
    enabled: !!id,
  });

  // Fetch doctor availability for selected date
  const { data: availabilityData, isLoading: slotsLoading } = useQuery({
    queryKey: ['doctorAvailability', id, selectedDate],
    queryFn: () => api.get<{ slots: { slot: string; isBooked: boolean }[] }>(`/doctors/${id}/availability?date=${selectedDate}`),
    enabled: !!id && !!selectedDate,
  });

  if (isLoading) {
    return <LoadingState message="Loading physician profile..." minHeight="min-h-[60vh]" />;
  }

  if (isError || !doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <Link
          to="/doctors"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Doctor Directory
        </Link>
      </div>
    );
  }

  // Next 7 calendar days options
  const upcomingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate(`/login?returnUrl=/doctors/${doctor._id}`);
      return;
    }

    if (!selectedSlot) {
      setError('Please select an available consultation time slot.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/appointments', {
        doctorId: doctor._id,
        patientName,
        patientPhone,
        patientEmail,
        patientAge: Number(patientAge),
        patientGender,
        symptoms,
        consultationType,
        date: selectedDate,
        timeSlot: selectedSlot,
      });

      navigate('/user/appointments?booked=true');
    } catch (err: any) {
      setError(err.message || 'Could not schedule appointment. Slot may have been taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <span>/</span>
        <Link to="/doctors" className="hover:text-emerald-600">Doctors</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{doctor.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Doctor Profile Monograph */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center">
            <img
              src={doctor.avatar || 'https://images.unsplash.com/photo-1594824813511-19d452093e9a?auto=format&fit=crop&q=80&w=300'}
              alt={doctor.name}
              className="w-28 h-28 rounded-3xl object-cover border-2 border-emerald-500/20 shadow-md mx-auto mb-4"
            />
            <h1 className="text-xl font-black text-slate-900">{doctor.name}</h1>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
              {doctor.specialization}
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-500 mt-2">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-slate-800">{doctor.rating}</span>
              <span className="text-slate-400">({doctor.reviewCount} verified reviews)</span>
            </div>
          </div>

          <div className="space-y-3 py-4 border-y border-slate-100 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Clinical Experience</span>
              <span className="font-bold text-slate-800">{doctor.experienceYears}+ Years</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Hospital Affiliation</span>
              <span className="font-bold text-slate-800 text-right max-w-[170px] truncate">
                {doctor.hospitalAffiliation || 'Medicare Medical Center'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Languages Spoken</span>
              <span className="font-bold text-slate-800">{doctor.languages?.join(', ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Consultation Fee</span>
              <span className="text-base font-extrabold text-slate-900">${doctor.consultationFee}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Qualifications</h3>
            <ul className="space-y-1 text-xs text-slate-600">
              {doctor.qualifications?.map((q, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Physician Bio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{doctor.biography}</p>
          </div>
        </div>

        {/* Right Column: Interactive Appointment Booking Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Schedule Consultation</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your preferred appointment date, active time slot, and patient background.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Consultation Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Consultation Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationType('VIDEO')}
                  className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    consultationType === 'VIDEO'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Video className="w-4 h-4 text-emerald-600" />
                  <span>Video Telehealth</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType('IN_PERSON')}
                  className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    consultationType === 'IN_PERSON'
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>In-Person Visit</span>
                </button>
              </div>
            </div>

            {/* Date Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Date</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {upcomingDays.map((d) => (
                  <button
                    key={d.dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.dateStr);
                      setSelectedSlot('');
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition ${
                      selectedDate === d.dateStr
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block text-[10px] uppercase font-bold">{d.dayName}</span>
                    <span className="block text-base font-black my-0.5">{d.dayNumber}</span>
                    <span className="block text-[10px]">{d.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Picker (Anti-conflict) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Available Time Slots on {selectedDate}
              </label>

              {slotsLoading ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading slots...</div>
              ) : !availabilityData?.slots || availabilityData.slots.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
                  No slots configured for this date.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availabilityData.slots.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={s.isBooked}
                      onClick={() => setSelectedSlot(s.slot)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        s.isBooked
                          ? 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                          : selectedSlot === s.slot
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                          : 'border-slate-200 hover:bg-emerald-50 text-slate-800'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{s.slot}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Patient Details */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Patient Consultation Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="FEMALE">Female</option>
                      <option value="MALE">Male</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Describe Symptoms / Clinical Concerns
                  </label>
                  <textarea
                    rows={3}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Experiencing mild shortness of breath during morning workouts for the past week."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Confirmation CTA */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Total Consultation Fee</span>
                <span className="text-2xl font-black text-slate-900">
                  ${doctor.consultationFee}
                </span>
              </div>

              <button
                id="doc-book-submit-btn"
                type="submit"
                disabled={submitting || !selectedSlot}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Confirming Appointment...' : 'Confirm Appointment Booking'}{' '}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
