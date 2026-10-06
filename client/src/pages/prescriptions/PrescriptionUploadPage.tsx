import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  FileText,
  FileCheck,
  AlertCircle,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { HealthcareDisclaimer } from '../../components/common/HealthcareDisclaimer';

export const PrescriptionUploadPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientAge, setPatientAge] = useState('32');
  const [patientGender, setPatientGender] = useState('FEMALE');
  const [doctorName, setDoctorName] = useState('');
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const validFiles = selected.filter((file) => {
        const isValid = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'].includes(file.type);
        const isUnderLimit = file.size <= 10 * 1024 * 1024;
        return isValid && isUnderLimit;
      });

      if (validFiles.length < selected.length) {
        setError('Some files were skipped: Only PDF, JPG, PNG under 10MB are permitted.');
      }
      setFiles((prev) => [...prev, ...validFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login?returnUrl=/prescriptions/upload');
      return;
    }

    if (files.length === 0) {
      setError('Please attach at least one prescription document (PDF or Image).');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('patientName', patientName);
      formData.append('patientAge', patientAge);
      formData.append('patientGender', patientGender);
      formData.append('doctorName', doctorName);
      formData.append('prescriptionDate', prescriptionDate);
      formData.append('notes', notes);

      files.forEach((file) => {
        formData.append('files', file);
      });

      await api.upload('/prescriptions', formData);
      navigate('/user/prescriptions?uploaded=true');
    } catch (err: any) {
      setError(err.message || 'Could not upload prescription. Please verify your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
          Certified Clinical Pharmacy Services
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Upload Doctor’s Prescription
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Upload clear scans or photos of your physical prescription. A licensed clinical pharmacist reviews your medical documentation before medication dispensing.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Drag and Drop Zone */}
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer relative">
          <input
            id="rx-file-upload-input"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Upload className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Drag & drop prescription files, or browse
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, JPG, JPEG, and PNG files up to 10MB per document (max 5 files).
            </p>
          </div>
        </div>

        {/* Selected files preview */}
        {files.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Attached Documents ({files.length})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="truncate font-medium text-slate-800">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Patient & Doctor Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                required
                min={0}
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
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Prescribing Doctor (Optional)</label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="e.g. Dr. Robert MacIntyre"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Date on Prescription</label>
            <input
              type="date"
              required
              value={prescriptionDate}
              onChange={(e) => setPrescriptionDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Special Clinical Notes or Instructions</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please substitute generic if available; need 30-day supply only."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Security & Regulatory reassurance */}
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Your medical documents are encrypted and accessible exclusively to licensed pharmacists assigned to your care.
          </span>
        </div>

        <button
          id="rx-upload-submit-btn"
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? 'Uploading & Encrypting...' : 'Submit Prescription for Verification'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <HealthcareDisclaimer type="prescription" />
    </div>
  );
};
