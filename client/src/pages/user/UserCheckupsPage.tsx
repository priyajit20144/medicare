import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
} from 'lucide-react';
import { api } from '../../api/client';
import { HealthCheckupBooking, HealthCheckupResult } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const UserCheckupsPage: React.FC = () => {
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['myCheckupBookings'],
    queryFn: () => api.get<HealthCheckupBooking[]>('/health-checkups/bookings/my'),
  });

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['myCheckupResults'],
    queryFn: () => api.get<HealthCheckupResult[]>('/health-checkups/results/my'),
  });

  const isLoading = bookingsLoading || resultsLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            My Health Checkups & Diagnostic Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View booked preventative checkups, pathology sample statuses, and download official medical reports.
          </p>
        </div>

        <Link
          to="/health-checkups"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
        >
          <Activity className="w-3.5 h-3.5" /> Book Health Checkup
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Loading checkup records and diagnostic reports..." />
      ) : (
        <div className="space-y-8">
          {/* Verified Reports Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" /> Verified Diagnostic Reports ({results?.length || 0})
            </h2>

            {!results || results.length === 0 ? (
              <p className="text-xs text-slate-400 bg-white p-6 rounded-2xl border border-slate-200 text-center">
                No diagnostic reports currently published.
              </p>
            ) : (
              <div className="space-y-4">
                {results.map((res) => (
                  <div
                    key={res._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {res.packageId?.name || 'Comprehensive Health Checkup'}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          Verified by {res.verifiedBy || 'Pathology Medical Director'}
                        </span>
                      </div>
                      <StatusBadge status={res.status} />
                    </div>

                    {res.summaryObservations && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                        <strong className="block text-slate-800 font-bold">Clinical Observations:</strong>
                        <p className="text-slate-600 leading-relaxed">{res.summaryObservations}</p>
                      </div>
                    )}

                    {res.recommendations && (
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1 text-xs">
                        <strong className="block text-emerald-900 font-bold">Preventative Recommendations:</strong>
                        <p className="text-emerald-800 leading-relaxed">{res.recommendations}</p>
                      </div>
                    )}

                    {res.reportFile && res.reportFile.filename && (
                      <div className="pt-2 flex justify-end">
                        <a
                          href={`/api/health-checkups/results/${res._id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                        >
                          <Download className="w-3.5 h-3.5" /> Download Diagnostic PDF Report
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookings Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Scheduled Checkup Appointments ({bookings?.length || 0})
            </h2>

            {!bookings || bookings.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No Checkup Bookings"
                description="Take proactive control of your wellness with our 20+ laboratory tests."
                actionText="Explore Checkup Packages"
                actionLink="/health-checkups"
              />
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {b.packageId?.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          #{b.bookingNumber}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        Facility: <strong>{b.facilityId?.name} ({b.facilityId?.city})</strong>
                      </p>
                      <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                        Scheduled on {b.bookingDate} at {b.timeSlot} ({b.sampleCollectionType.replace(/_/g, ' ')})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={b.status} />
                      <span className="font-bold text-slate-900">${b.payment?.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
