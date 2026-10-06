import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
  Check,
  CheckCircle2,
  AlertCircle,
  Video,
  User,
  DollarSign,
  Palmtree,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../../api/client';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MORNING_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
const AFTERNOON_SLOTS = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

export const AvailabilityView: React.FC = () => {
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ]);

  const [activeSlots, setActiveSlots] = useState<string[]>([
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ]);

  const [consultationFee, setConsultationFee] = useState<number>(120);
  const [allowVideo, setAllowVideo] = useState(true);
  const [allowInPerson, setAllowInPerson] = useState(true);
  const [isVacation, setIsVacation] = useState(false);
  const [vacationNote, setVacationNote] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSlot = (slot: string) => {
    setActiveSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const types: ('IN_PERSON' | 'VIDEO')[] = [];
      if (allowInPerson) types.push('IN_PERSON');
      if (allowVideo) types.push('VIDEO');

      await api.patch('/doctors/portal/availability', {
        availableDays: selectedDays,
        availableSlots: activeSlots,
        consultationFee,
        consultationTypes: types.length > 0 ? types : ['IN_PERSON', 'VIDEO'],
      });

      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-500/20">
              <Clock className="w-5 h-5 text-teal-600" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Consultation Hours & Availability</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure your clinical working schedule, time slots, consultation rates, and vacation leave parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 transition disabled:opacity-50 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Schedule...' : 'Save Availability'}</span>
        </button>
      </div>

      {/* Save feedback banner */}
      {saveStatus === 'success' && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Availability schedule and consultation rates updated successfully!</span>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>Failed to save schedule changes to the server. Please try again.</span>
        </div>
      )}

      {/* Section 1: Weekly Consultation Days */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" /> Active Working Days
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select the days of the week when you accept clinical appointments.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {WEEK_DAYS.map((day) => {
            const isSelected = selectedDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 text-teal-900 ring-2 ring-teal-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className="text-xs font-bold">{day.slice(0, 3)}</span>
                <span className="text-[10px] text-slate-400 font-medium">{day}</span>
                <span
                  className={`mt-1 w-2 h-2 rounded-full ${
                    isSelected ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Clinical Shift Slots */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" /> Standard Time Slots
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click time slot chips to toggle appointment availability for patients.
          </p>
        </div>

        {/* Morning Shift */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Morning Clinical Sessions (09:00 AM - 12:00 PM)
          </span>
          <div className="flex flex-wrap gap-2">
            {MORNING_SLOTS.map((slot) => {
              const isSelected = activeSlots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(slot)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Afternoon Shift */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Afternoon & Evening Sessions (02:00 PM - 05:00 PM)
          </span>
          <div className="flex flex-wrap gap-2">
            {AFTERNOON_SLOTS.map((slot) => {
              const isSelected = activeSlots.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(slot)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: Consultation Parameters & Fees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-teal-600" /> Rates & Consultation Fee
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Standard Consultation Fee ($ USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
              <input
                type="number"
                min={0}
                step={5}
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Applied per 30-minute clinical session across in-clinic and video visits.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Accepted Formats</span>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowVideo}
                  onChange={(e) => setAllowVideo(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-cyan-600" /> Telehealth Video Calls
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowInPerson}
                  onChange={(e) => setAllowInPerson(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-600" /> In-Clinic Examinations
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 4: Vacation / Out of Office */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Palmtree className="w-4 h-4 text-teal-600" /> Leave & Out-of-Office Mode
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-900">Mark as Away / On Leave</p>
              <p className="text-[11px] text-slate-500">Temporarily pauses new appointment bookings.</p>
            </div>
            <input
              type="checkbox"
              checked={isVacation}
              onChange={(e) => setIsVacation(e.target.checked)}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
            />
          </div>

          {isVacation && (
            <div className="space-y-2 pt-2 animate-in fade-in">
              <label className="block text-xs font-bold text-slate-700">
                Patient Notice Message
              </label>
              <textarea
                rows={2}
                placeholder="Dr. Reyes is currently attending a cardiology conference and will resume clinic hours on Monday..."
                value={vacationNote}
                onChange={(e) => setVacationNote(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
