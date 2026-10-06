import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../api/client';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminAuditLogsPage: React.FC = () => {
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['adminAuditLogs', actionFilter, resourceFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (resourceFilter) params.append('resourceType', resourceFilter);
      params.append('page', String(page));
      params.append('limit', '25');
      return api.get<{
        auditLogs: any[];
        pagination: { total: number; totalPages: number; page: number };
      }>(`/admin/audit-logs?${params.toString()}`);
    },
  });

  const logs = data?.auditLogs || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  if (isLoading) {
    return <LoadingState message="Loading security audit trail..." minHeight="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Immutable Security Audit Trail</h1>
          <p className="text-sm text-slate-400">
            Cryptographically tracked clinical, prescription, administrative and access audit records.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Security Actions</option>
              <option value="USER_REGISTERED">User Registered</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="PRESCRIPTION_REVIEWED">Prescription Reviewed</option>
              <option value="ORDER_STATUS_UPDATED">Order Status Updated</option>
              <option value="ADMIN_USER_UPDATED">Admin User Updated</option>
              <option value="FACILITY_CREATED">Facility Created</option>
            </select>
          </div>

          <div>
            <select
              value={resourceFilter}
              onChange={(e) => {
                setResourceFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Target Resources</option>
              <option value="User">User</option>
              <option value="Prescription">Prescription</option>
              <option value="Order">Order</option>
              <option value="Appointment">Appointment</option>
              <option value="Facility">Facility</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center">
          Total Logged Events: {pagination.total}
        </div>
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <EmptyState
          title="No security audit events recorded"
          description="Actions performed by clinicians, pharmacists, and admins will appear here."
          icon={ShieldAlert}
        />
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-left text-sm text-slate-300 min-w-[760px]">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-xs font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Action / Event</th>
                  <th className="py-4 px-6">Actor (User)</th>
                  <th className="py-4 px-6">Target Resource</th>
                  <th className="py-4 px-6">Client IP</th>
                  <th className="py-4 px-6">Metadata Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt || log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-400 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-4 px-6 font-sans">
                      <div className="font-semibold text-white">
                        {log.userId?.fullName || log.userId?.name || log.actor || 'System'}
                      </div>
                      <div className="text-[11px] text-slate-500">{log.userId?.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                        {log.resourceType}: {log.resourceId?.slice(-6) || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-4 px-6 text-[11px] text-slate-400 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4 inline" /> Prev
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
