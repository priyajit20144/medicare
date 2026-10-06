import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Upload,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  FileCheck,
  ShoppingBag,
} from 'lucide-react';
import { api } from '../../api/client';
import { Prescription } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const UserPrescriptionsPage: React.FC = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ['myPrescriptions'],
    queryFn: () => api.get<{ prescriptions: Prescription[]; pagination: any }>('/prescriptions/my'),
  });

  const prescriptions = response?.prescriptions || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            My Medical Prescriptions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Uploaded prescriptions, pharmacist verification statuses, and approved drug regimens.
          </p>
        </div>

        <Link
          to="/prescriptions/upload"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" /> Upload New Prescription
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Prescriptions Uploaded"
          description="Upload your doctor’s physical prescription to have it verified and unlock prescription-only medication purchasing."
          actionText="Upload Prescription Now"
          actionLink="/prescriptions/upload"
        />
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div
              key={rx._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Patient: {rx.patientName} {rx.doctorName && `• Prescribing Doctor: ${rx.doctorName}`}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Uploaded on {new Date(rx.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={rx.status} />
                  {rx.validUntil && (
                    <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      Valid until: {new Date(rx.validUntil).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Review notes if any */}
              {rx.reviewNotes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                  <strong className="block text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    Pharmacist Clinical Review Notes:
                  </strong>
                  <p>{rx.reviewNotes}</p>
                </div>
              )}

              {/* Recommended Medicines */}
              {rx.recommendedMedicines && rx.recommendedMedicines.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Prescribed Drug Dosage Regimen:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {rx.recommendedMedicines.map((rec: any, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1"
                      >
                        <span className="font-bold text-slate-900 block">
                          {rec.medicineId?.name || 'Prescription Medication'}
                        </span>
                        <div className="text-[11px] text-slate-600">
                          <span>Dosage: {rec.dosage}</span> • <span>Freq: {rec.frequency}</span> • <span>Duration: {rec.duration}</span>
                        </div>
                        {rec.instructions && (
                          <p className="text-[10px] text-slate-500 italic">{rec.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files download */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {rx.files?.map((f, i) => (
                    <a
                      key={i}
                      href={`/api/prescriptions/${rx._id}/files/${f.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="truncate max-w-[140px]">{f.originalName}</span>
                    </a>
                  ))}
                </div>

                {rx.status === 'APPROVED' && (
                  <Link
                    to="/medicines"
                    className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Purchase Approved Medicines →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
