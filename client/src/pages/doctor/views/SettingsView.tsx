import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Lock,
  Video,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Save,
  Sliders,
  Check,
  AlertTriangle,
  Smartphone,
  Mail,
  Zap,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  // Practice Automation
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [sameDayBooking, setSameDayBooking] = useState(true);
  const [bufferTime, setBufferTime] = useState('10');
  const [defaultDuration, setDefaultDuration] = useState('30');

  // Telehealth video
  const [videoPlatform, setVideoPlatform] = useState('Medicare WebRTC Engine');
  const [hdVideo, setHdVideo] = useState(true);
  const [cloudRecording, setCloudRecording] = useState(false);
  const [backgroundBlur, setBackgroundBlur] = useState(true);

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsReminders, setSmsReminders] = useState(true);
  const [rxClarificationAlerts, setRxClarificationAlerts] = useState(true);
  const [messageSound, setMessageSound] = useState(true);
  const [dailyBriefing, setDailyBriefing] = useState(true);

  // Security
  const [twoFactor, setTwoFactor] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Passwords do not match or are empty.');
      return;
    }
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSaved(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-[1300px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-500/20">
              <Settings className="w-5 h-5 text-teal-600" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Clinical Practice & Portal Settings</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize appointment booking automation, telehealth video preferences, clinical alerts, and account credentials.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 transition shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your practice preferences and portal settings were successfully updated!</span>
        </div>
      )}

      {/* Grid of Settings Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Module 1: Appointment Automation */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Booking & Scheduling Automation</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900 text-xs">Auto-Confirm Verified Bookings</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automatically approves appointments from patients who completed intake.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoConfirm}
                onChange={(e) => setAutoConfirm(e.target.checked)}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900 text-xs">Allow Same-Day Appointments</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Permits booking slots up to 2 hours prior to start time.
                </p>
              </div>
              <input
                type="checkbox"
                checked={sameDayBooking}
                onChange={(e) => setSameDayBooking(e.target.checked)}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 shrink-0"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Buffer Between Sessions
                </label>
                <select
                  value={bufferTime}
                  onChange={(e) => setBufferTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-teal-500"
                >
                  <option value="0">No buffer</option>
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes (Recommended)</option>
                  <option value="15">15 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Default Consultation Duration
                </label>
                <select
                  value={defaultDuration}
                  onChange={(e) => setDefaultDuration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-teal-500"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes (Standard)</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Telehealth Video Configuration */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Video className="w-5 h-5 text-cyan-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Telehealth Video Platform</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Virtual Video Provider
              </label>
              <select
                value={videoPlatform}
                onChange={(e) => setVideoPlatform(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-teal-500"
              >
                <option value="Medicare WebRTC Engine">Medicare Native Encrypted WebRTC (Default)</option>
                <option value="Zoom Healthcare API">Zoom for Healthcare</option>
                <option value="Google Meet Clinical">Google Meet Integration</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900 text-xs">High-Definition 1080p Stream</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Provides high visual clarity for remote physical examinations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={hdVideo}
                onChange={(e) => setHdVideo(e.target.checked)}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900 text-xs">Virtual Background Blur</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Applies medical-grade studio background blur to consultations.
                </p>
              </div>
              <input
                type="checkbox"
                checked={backgroundBlur}
                onChange={(e) => setBackgroundBlur(e.target.checked)}
                className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Module 3: Notifications & Communication */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Alerts & Clinical Notifications</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-900">Email Booking Notifications</p>
                  <p className="text-[11px] text-slate-500">Receive email alerts for bookings & cancellations.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-900">SMS Urgent Text Reminders</p>
                  <p className="text-[11px] text-slate-500">Send SMS text 15 minutes prior to appointment.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsReminders}
                onChange={(e) => setSmsReminders(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="font-bold text-slate-900">Pharmacy Clarification Alerts</p>
                  <p className="text-[11px] text-slate-500">Instant notification when pharmacist queries an Rx.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={rxClarificationAlerts}
                onChange={(e) => setRxClarificationAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>
          </div>
        </div>

        {/* Module 4: Account Security & Password */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Security & Password</h3>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
            <div>
              <p className="font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
              <p className="text-[11px] text-slate-500">Enforces two-step code upon clinician sign-in.</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Enabled
            </span>
          </div>

          {passwordSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3 text-xs pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!newPassword || !confirmPassword}
              className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
