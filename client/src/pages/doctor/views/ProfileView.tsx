import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Stethoscope,
  Building2,
  Award,
  DollarSign,
  Globe,
  Save,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export const ProfileView: React.FC = () => {
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || 'Dr. Sophia Reyes');
  const [email, setEmail] = useState(user?.email || 'dr.reyes@medicare.demo');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [specialization, setSpecialization] = useState('Cardiology & Vascular Medicine');
  const [qualifications, setQualifications] = useState('MBBS, MD - Cardiology, FACC');
  const [experience, setExperience] = useState('14');
  const [hospital, setHospital] = useState('Medicare Central Medical Hospital');
  const [languages, setLanguages] = useState('English, Spanish, French');
  const [consultationFee, setConsultationFee] = useState('120');
  const [biography, setBiography] = useState(
    'Board-certified cardiologist specializing in preventive cardiovascular wellness, non-invasive imaging, and hypertension management with over 14 years of dedicated clinical practice.'
  );

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-500/20">
              <User className="w-5 h-5 text-teal-600" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Physician Profile & Credentials</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your verified clinician credentials, clinical biography, degrees, and hospital affiliations.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Doctor profile information and credentials updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        {/* Avatar & Key Status */}
        <div className="flex items-center gap-4 sm:gap-5 pb-6 border-b border-slate-100">
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
            alt={fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">{fullName}</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Board Certified
              </span>
            </div>
            <p className="text-xs font-semibold text-teal-700 mt-0.5">{specialization}</p>
            <p className="text-[11px] text-slate-400 mt-1">{hospital}</p>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email (Account)</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Medical Specialization</label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications / Degrees</label>
            <input
              type="text"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Years of Clinical Experience</label>
            <input
              type="number"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Affiliation</label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Languages Spoken</label>
            <input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Care Philosophy & Biography</label>
          <textarea
            rows={3}
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500 leading-relaxed"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Details</span>
          </button>
        </div>
      </form>
    </div>
  );
};
