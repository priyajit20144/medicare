import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Check,
  Printer,
  Download,
  Stethoscope,
  Pill,
  User,
  X,
} from 'lucide-react';

interface PrescriptionsViewProps {
  onOpenWriter?: () => void;
}

const INITIAL_PRESCRIPTIONS = [
  {
    id: 'pr-1024',
    code: 'Rx #PR-1024',
    patientName: 'Rahul Mehta',
    patientAge: 38,
    date: '2025-10-06',
    medications: [
      { drug: 'Atorvastatin 20mg', dosage: '1 tablet nightly', duration: '30 days' },
      { drug: 'CoQ10 100mg', dosage: '1 softgel morning', duration: '30 days' },
    ],
    status: 'AWAITING_APPROVAL',
    statusLabel: 'Awaiting Approval',
    pharmacyNotes: 'Pharmacist awaiting signature verification.',
  },
  {
    id: 'pr-1023',
    code: 'Rx #PR-1023',
    patientName: 'Anita Sharma',
    patientAge: 44,
    date: '2025-10-06',
    medications: [
      { drug: 'Metformin 500mg ER', dosage: '1 tablet twice daily with meals', duration: '60 days' },
    ],
    status: 'NEEDS_CLARIFICATION',
    statusLabel: 'Needs Clarification',
    pharmacyNotes: 'Pharmacist queried kidney eGFR clearance validation.',
  },
  {
    id: 'pr-1022',
    code: 'Rx #PR-1022',
    patientName: 'Vikram Singh',
    patientAge: 51,
    date: '2025-10-05',
    medications: [
      { drug: 'Amlodipine 5mg', dosage: '1 tablet daily in morning', duration: '90 days' },
      { drug: 'Telmisartan 40mg', dosage: '1 tablet daily', duration: '90 days' },
    ],
    status: 'APPROVED',
    statusLabel: 'Approved & Dispensed',
    pharmacyNotes: 'Dispensed by Medicare Central Pharmacy.',
  },
  {
    id: 'pr-1021',
    code: 'Rx #PR-1021',
    patientName: 'Sarah Jenkins',
    patientAge: 32,
    date: '2025-10-04',
    medications: [
      { drug: 'Melatonin 5mg Dual-Release', dosage: '1 tablet before sleep', duration: '14 days' },
    ],
    status: 'APPROVED',
    statusLabel: 'Approved & Dispensed',
    pharmacyNotes: 'Delivered to patient address.',
  },
];

export const PrescriptionsView: React.FC<PrescriptionsViewProps> = () => {
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isWriterOpen, setIsWriterOpen] = useState(false);

  // New Rx form states
  const [patientName, setPatientName] = useState('');
  const [drugName, setDrugName] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('30 days');
  const [instructions, setInstructions] = useState('');

  const handleApprove = (id: string) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'APPROVED', statusLabel: 'Approved & Signed' } : p
      )
    );
  };

  const handleCreateRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !drugName.trim()) return;

    const newRx = {
      id: `pr-${Date.now().toString().slice(-4)}`,
      code: `Rx #PR-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: patientName.trim(),
      patientAge: 35,
      date: new Date().toISOString().split('T')[0],
      medications: [
        {
          drug: drugName.trim(),
          dosage: dosage.trim() || '1 tablet daily',
          duration: duration.trim(),
        },
      ],
      status: 'APPROVED',
      statusLabel: 'Approved & Signed',
      pharmacyNotes: 'Digitally signed and forwarded to central pharmacy dispatch.',
    };

    setPrescriptions([newRx, ...prescriptions]);
    setIsWriterOpen(false);
    setPatientName('');
    setDrugName('');
    setDosage('');
    setInstructions('');
  };

  const filtered = prescriptions.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.patientName.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.medications.some((m) => m.drug.toLowerCase().includes(q));

    const matchFilter = filter === 'ALL' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-500/20">
              <FileText className="w-5 h-5 text-teal-600" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Digital Prescriptions & Pharmacotherapy</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Author and authorize digital prescriptions, address clinical pharmacy clarification requests, and track dispensing status.
          </p>
        </div>

        <button
          onClick={() => setIsWriterOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-teal-700/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Write Digital Rx</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Rx</span>
            <FileText className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1.5">{prescriptions.length}</p>
          <span className="text-[11px] text-slate-400">Recorded prescriptions</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Pending Review</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1.5">
            {prescriptions.filter((p) => p.status === 'AWAITING_APPROVAL').length}
          </p>
          <span className="text-[11px] text-slate-400">Requires doctor sign-off</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Clarifications</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1.5">
            {prescriptions.filter((p) => p.status === 'NEEDS_CLARIFICATION').length}
          </p>
          <span className="text-[11px] text-slate-400">Pharmacy inquiries</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1.5">
            {prescriptions.filter((p) => p.status === 'APPROVED').length}
          </p>
          <span className="text-[11px] text-slate-400">Signed & dispensed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row gap-3 md:items-center justify-between shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Rx code, patient name, medication..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'AWAITING_APPROVAL', 'NEEDS_CLARIFICATION', 'APPROVED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === tab
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'ALL'
                ? 'All'
                : tab === 'AWAITING_APPROVAL'
                ? 'Awaiting Approval'
                : tab === 'NEEDS_CLARIFICATION'
                ? 'Clarification'
                : 'Approved'}
            </button>
          ))}
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filtered.map((rx) => (
          <motion.div
            key={rx.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 transition shadow-xs space-y-4 hover:border-teal-500/40"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-teal-50 text-teal-700 font-mono font-black text-xs">
                  {rx.code}
                </span>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{rx.patientName}</h3>
                  <span className="text-xs text-slate-500">
                    {rx.patientAge} yrs • Prescribed {rx.date}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
                  rx.status === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : rx.status === 'NEEDS_CLARIFICATION'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {rx.statusLabel}
              </span>
            </div>

            {/* Prescribed Medications */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Prescribed Regimen:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {rx.medications.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">{m.drug}</p>
                        <p className="text-[11px] text-slate-500">{m.dosage}</p>
                      </div>
                    </div>
                    <span className="bg-white px-2 py-0.5 rounded-md font-semibold text-slate-600 border border-slate-200 text-[10px]">
                      {m.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <p className="text-slate-500 italic text-[11px]">{rx.pharmacyNotes}</p>

              <div className="flex items-center gap-2">
                {rx.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleApprove(rx.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Sign & Approve</span>
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  title="Print Digital Rx"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Write New Prescription Modal */}
      {isWriterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">Author Digital Prescription</h3>
              </div>
              <button
                onClick={() => setIsWriterOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRx} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medication Name & Strength *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atorvastatin 20mg or Amoxicillin 500mg"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dosage & Frequency
                  </label>
                  <input
                    type="text"
                    placeholder="1 tablet twice daily"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Instructions / Intake Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Take after food with plenty of water. Avoid alcohol."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWriterOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Sign & Issue Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
