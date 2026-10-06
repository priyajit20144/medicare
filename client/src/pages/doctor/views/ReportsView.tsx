import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  Video,
  User,
  Download,
  ArrowUpRight,
  Award,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';

const RECENT_SETTLEMENTS = [
  { id: 'st-1', patient: 'Sarah Jenkins', date: '2025-10-07', format: 'Telehealth Video', fee: 120, platformFee: 12, net: 108, status: 'Settled' },
  { id: 'st-2', patient: 'James Wilson', date: '2025-10-07', format: 'In-Person Visit', fee: 90, platformFee: 9, net: 81, status: 'Settled' },
  { id: 'st-3', patient: 'Priya Sharma', date: '2025-10-06', format: 'Telehealth Video', fee: 120, platformFee: 12, net: 108, status: 'Settled' },
  { id: 'st-4', patient: 'Robert Davis', date: '2025-10-05', format: 'In-Person Visit', fee: 100, platformFee: 10, net: 90, status: 'Settled' },
  { id: 'st-5', patient: 'Elena Rostova', date: '2025-10-04', format: 'Telehealth Video', fee: 120, platformFee: 12, net: 108, status: 'Processing' },
  { id: 'st-6', patient: 'Marcus Brody', date: '2025-10-03', format: 'In-Person Visit', fee: 110, platformFee: 11, net: 99, status: 'Settled' },
];

export const ReportsView: React.FC = () => {
  const handleExport = () => {
    alert('Exporting clinical earnings report (CSV format) for your records...');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-700 border border-teal-500/20">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Practice Earnings & Analytical Reports</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track consultation earnings, telehealth vs in-clinic revenue breakdown, patient volume trends, and payout distributions.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Summary (CSV)</span>
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Revenue</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-black text-slate-900">$4,850.00</p>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14%
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Current billing cycle</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Sessions</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">48</p>
          <span className="text-[11px] text-slate-400">Zero cancellation disputes</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Fee</span>
            <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">$101.04</p>
          <span className="text-[11px] text-slate-400">Per 30-min consultation</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Satisfaction</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">4.9 / 5.0</p>
          <span className="text-[11px] text-slate-400">From 124 patient reviews</span>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Format Share */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Revenue by Consultation Format</h3>
          <p className="text-xs text-slate-500">Distribution across Telehealth Video and In-Clinic appointments.</p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-cyan-800">
                  <Video className="w-3.5 h-3.5 text-cyan-600" /> Telehealth Video (65%)
                </span>
                <span className="text-slate-900 font-extrabold">$3,150.00</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-600" /> In-Clinic Visits (35%)
                </span>
                <span className="text-slate-900 font-extrabold">$1,700.00</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-600 to-slate-800 h-3 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Weekly Consultation Volume</h3>
          <p className="text-xs text-slate-500">Weekly patient consultations over the current calendar month.</p>

          <div className="grid grid-cols-4 gap-3 pt-4 text-center">
            {[
              { label: 'Week 1', sessions: 11, rev: '$1,120' },
              { label: 'Week 2', sessions: 14, rev: '$1,410' },
              { label: 'Week 3', sessions: 12, rev: '$1,220' },
              { label: 'Week 4', sessions: 11, rev: '$1,100' },
            ].map((w, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400">{w.label}</span>
                <span className="text-xl font-black text-teal-800 my-1">{w.sessions}</span>
                <span className="text-xs font-bold text-slate-700">{w.rev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settlements Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Recent Consultation Settlements</h3>

        <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Gross Fee</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_SETTLEMENTS.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-900">{st.patient}</td>
                  <td className="py-3 px-4 text-slate-500">{st.date}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      {st.format}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-600">${st.fee.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600">${st.net.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        st.status === 'Settled'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
