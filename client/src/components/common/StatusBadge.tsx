import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['APPROVED', 'CONFIRMED', 'DELIVERED', 'COMPLETED', 'ACTIVE', 'VERIFIED'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['PENDING', 'PENDING_REVIEW', 'PENDING_PAYMENT', 'UNDER_REVIEW', 'PROCESSING', 'PHARMACY_REVIEW'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500 animate-pulse';
  } else if (['SHIPPED', 'READY_TO_SHIP'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (['REJECTED', 'CANCELLED', 'EXPIRED', 'OUT_OF_STOCK', 'SUSPENDED'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (['CLARIFICATION_REQUIRED', 'RESCHEDULE_REQUESTED'].includes(normalized)) {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
  }

  const formattedText = normalized.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${styles} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {formattedText}
    </span>
  );
};
