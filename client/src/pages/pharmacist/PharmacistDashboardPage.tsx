import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Pill,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Eye,
  Download,
  Filter,
  User,
  Plus,
  Trash2,
} from 'lucide-react';
import { api } from '../../api/client';
import { Prescription, Medicine } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';

export const PharmacistDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [search, setSearch] = useState('');
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);

  // Review modal state
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'REJECTED' | 'CLARIFICATION_REQUIRED'>('APPROVED');
  const [reviewNotes, setReviewNotes] = useState('');
  const [recommendedMedicines, setRecommendedMedicines] = useState<any[]>([]);

  // Fetch prescription queue
  const { data: queueData, isLoading } = useQuery({
    queryKey: ['pharmacistQueue', statusFilter, search],
    queryFn: () =>
      api.get<{ prescriptions: Prescription[]; pagination: any }>('/prescriptions/queue/all', {
        status: statusFilter || undefined,
        search: search || undefined,
      }),
  });

  // Fetch medicines catalog for recommendation dropdown
  const { data: medicinesData } = useQuery({
    queryKey: ['allMedicinesList'],
    queryFn: () => api.get<{ medicines: Medicine[] }>('/medicines?limit=50'),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => api.patch(`/prescriptions/${id}/review`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacistQueue'] });
      setActivePrescription(null);
    },
  });

  const openReviewModal = (rx: Prescription) => {
    setActivePrescription(rx);
    setReviewStatus(rx.status === 'PENDING_REVIEW' ? 'APPROVED' : (rx.status as any));
    setReviewNotes(rx.reviewNotes || '');
    setRecommendedMedicines(rx.recommendedMedicines || []);
  };

  const handleAddMedicineRecommendation = () => {
    if (medicinesData?.medicines && medicinesData.medicines.length > 0) {
      setRecommendedMedicines([
        ...recommendedMedicines,
        {
          medicineId: medicinesData.medicines[0]._id,
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 Days',
          instructions: 'Take after meals.',
        },
      ]);
    }
  };

  const handleRemoveRecommendation = (index: number) => {
    setRecommendedMedicines(recommendedMedicines.filter((_, i) => i !== index));
  };

  const handleRecommendationChange = (index: number, field: string, val: string) => {
    const updated = [...recommendedMedicines];
    updated[index][field] = val;
    setRecommendedMedicines(updated);
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePrescription) return;

    reviewMutation.mutate({
      id: activePrescription._id,
      body: {
        status: reviewStatus,
        reviewNotes,
        recommendedMedicines,
      },
    });
  };

  const prescriptions = queueData?.prescriptions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-8 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Licensed Pharmacy Dispensing Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Clinical Prescription Verification Queue
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Review submitted patient doctor scripts, verify dosage safety, request clarifications, and authorize medication fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/20 text-xs font-bold">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Queue Count: {prescriptions.length} Records</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient or doctor name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Status Tab buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { label: 'Pending Review', value: 'PENDING_REVIEW' },
            { label: 'Under Review', value: 'UNDER_REVIEW' },
            { label: 'Approved', value: 'APPROVED' },
            { label: 'Clarification Needed', value: 'CLARIFICATION_REQUIRED' },
            { label: 'Rejected', value: 'REJECTED' },
            { label: 'All Prescriptions', value: '' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prescription Queue List */}
      {isLoading ? (
        <LoadingState message="Loading prescription review queue..." />
      ) : prescriptions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <FileCheck className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Prescription Queue is Clear</h3>
          <p className="text-xs text-slate-500">No prescriptions found matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div
              key={rx._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">
                      Patient: {rx.patientName}
                    </h3>
                    {rx.patientAge && (
                      <span className="text-xs text-slate-400">
                        ({rx.patientAge} y/o, {rx.patientGender})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prescribing Doctor: <strong>{rx.doctorName || 'Not specified'}</strong> • Submitted: {new Date(rx.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={rx.status} />
                  <button
                    onClick={() => openReviewModal(rx)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review & Fulfill
                  </button>
                </div>
              </div>

              {rx.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong>Patient Notes:</strong> {rx.notes}
                </p>
              )}

              {/* Document attachments preview */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold mr-1">Attached Files:</span>
                {rx.files?.map((f, idx) => (
                  <a
                    key={idx}
                    href={`/api/prescriptions/${rx._id}/files/${f.filename}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{f.originalName}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {activePrescription && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pharmacist Prescription Review
                </h2>
                <p className="text-xs text-slate-500">
                  Patient: {activePrescription.patientName} (Age: {activePrescription.patientAge})
                </p>
              </div>
              <button
                onClick={() => setActivePrescription(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitReview} className="space-y-6 text-xs">
              {/* Document Download Link */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Uploaded Documents</span>
                <div className="flex flex-wrap gap-2">
                  {activePrescription.files?.map((f, idx) => (
                    <a
                      key={idx}
                      href={`/api/prescriptions/${activePrescription._id}/files/${f.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-emerald-700 hover:bg-emerald-50 transition inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> View/Download {f.originalName}
                    </a>
                  ))}
                </div>
              </div>

              {/* Status Outcome Choice */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">Review Determination</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('APPROVED')}
                    className={`p-3 rounded-xl border text-center font-bold transition ${
                      reviewStatus === 'APPROVED'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('CLARIFICATION_REQUIRED')}
                    className={`p-3 rounded-xl border text-center font-bold transition ${
                      reviewStatus === 'CLARIFICATION_REQUIRED'
                        ? 'border-purple-600 bg-purple-50 text-purple-800 ring-1 ring-purple-600'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    ? Request Clarification
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('REJECTED')}
                    className={`p-3 rounded-xl border text-center font-bold transition ${
                      reviewStatus === 'REJECTED'
                        ? 'border-rose-600 bg-rose-50 text-rose-800 ring-1 ring-rose-600'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Pharmacist Notes & Verification Reasoning
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Physician medical license verified; dosage matches clinical monograph guidelines."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Medicine Recommendation Builder */}
              {reviewStatus === 'APPROVED' && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Approved Medication Regimen Mapping
                    </span>
                    <button
                      type="button"
                      onClick={handleAddMedicineRecommendation}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-[11px] hover:bg-emerald-100 transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Drug
                    </button>
                  </div>

                  {recommendedMedicines.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveRecommendation(idx)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Medicine</label>
                          <select
                            value={rec.medicineId}
                            onChange={(e) => handleRecommendationChange(idx, 'medicineId', e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                          >
                            {medicinesData?.medicines?.map((m) => (
                              <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Dosage</label>
                          <input
                            type="text"
                            value={rec.dosage}
                            onChange={(e) => handleRecommendationChange(idx, 'dosage', e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Frequency</label>
                          <input
                            type="text"
                            value={rec.frequency}
                            onChange={(e) => handleRecommendationChange(idx, 'frequency', e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Duration</label>
                          <input
                            type="text"
                            value={rec.duration}
                            onChange={(e) => handleRecommendationChange(idx, 'duration', e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActivePrescription(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {reviewMutation.isPending ? 'Submitting Determination...' : 'Record Review & Notify Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
