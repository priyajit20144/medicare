import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Notification } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const UserNotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ notifications: Notification[]; unreadCount: number }>('/notifications'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = response?.notifications || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time alerts regarding prescription reviews, appointment status, and orders.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={() => markAllMutation.mutate()}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {isLoading ? (
        <LoadingState message="Loading your notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No Notifications"
          description="You're all caught up! You'll receive updates here when your prescriptions or appointments change."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (!n.isRead) markReadMutation.mutate(n._id);
              }}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-slate-200/80 text-slate-600'
                  : 'bg-emerald-50/50 border-emerald-200 text-slate-900 ring-1 ring-emerald-500/20'
              }`}
            >
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                  )}
                  <h4 className="font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                    {n.type}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed pl-4">{n.message}</p>
                <span className="text-[10px] text-slate-400 pl-4 block mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {n.link && (
                <Link
                  to={n.link}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1 flex-shrink-0"
                >
                  View <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
