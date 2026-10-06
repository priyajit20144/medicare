import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  X,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../api/client';
import { Order } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [statusNotes, setStatusNotes] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminOrders', statusFilter],
    queryFn: () =>
      api.get<{ orders: Order[]; total: number }>(
        `/orders/admin/all${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`
      ),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { id: string; status: string; trackingNumber?: string; notes?: string }) =>
      api.patch(`/orders/admin/${vars.id}/status`, {
        status: vars.status,
        trackingNumber: vars.trackingNumber,
        notes: vars.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminAnalyticsOverview'] });
      setSelectedOrder(null);
      setNewStatus('');
      setTrackingNumber('');
      setStatusNotes('');
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to update order status');
    },
  });

  const handleOpenStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setStatusNotes(order.notes || '');
    setActionError(null);
  };

  const orders = data?.orders || [];
  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const orderNum = o.orderNumber?.toLowerCase() || '';
    const userName = o.user?.name?.toLowerCase() || '';
    const userEmail = o.user?.email?.toLowerCase() || '';
    return orderNum.includes(term) || userName.includes(term) || userEmail.includes(term);
  });

  if (isLoading) {
    return <LoadingState message="Loading administrative pharmacy orders..." minHeight="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Orders & Prescription Fulfillment</h1>
          <p className="text-sm text-slate-400">
            Oversee pharmacy order dispatch, prescription verification requirements, and fulfillment tracking.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Order #, Patient name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="PHARMACY_REVIEW">Pharmacy Review</option>
            <option value="READY_TO_SHIP">Ready to Ship</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="No customer pharmacy orders match your current search and filter criteria."
          icon={ShoppingBag}
        />
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-left text-sm text-slate-300 min-w-[780px]">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-xs font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Items</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Prescription</th>
                  <th className="py-4 px-6">Fulfillment</th>
                  <th className="py-4 px-6">Payment</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-6 font-mono font-bold text-white">
                      #{order.orderNumber}
                      <div className="text-xs font-normal text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{order.user?.name || 'Customer'}</div>
                      <div className="text-xs text-slate-400">{order.user?.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-200">
                        {order.items?.length || 0} item{order.items?.length === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-400">
                      ${order.total?.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      {order.prescriptionStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : order.prescriptionStatus === 'REQUIRED_PENDING' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40">
                          <FileCheck className="w-3 h-3" /> Rx Required
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">OTC / None</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={order.paymentStatus || 'PENDING'} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(order)}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manage Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" /> Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">
                  Customer: {selectedOrder.user?.name} ({selectedOrder.user?.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                {actionError}
              </div>
            )}

            {/* Order Items Preview */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Medications</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-slate-800/40 last:border-0">
                    <div>
                      <span className="font-semibold text-white">{item.medicine?.name || 'Medicine'}</span>
                      <span className="text-xs text-slate-400 ml-2">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-800">
                <span className="text-slate-300">Total Charged</span>
                <span className="text-emerald-400">${selectedOrder.total?.toFixed(2)}</span>
              </div>
            </div>

            {/* Status Update Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Update Fulfillment Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PENDING_PAYMENT">Pending Payment</option>
                  <option value="PAID">Paid (Awaiting Processing)</option>
                  <option value="PROCESSING">Processing in Pharmacy</option>
                  <option value="PHARMACY_REVIEW">Pharmacy Pharmacist Review</option>
                  <option value="READY_TO_SHIP">Ready for Dispatch / Shipment</option>
                  <option value="SHIPPED">Shipped (In Transit)</option>
                  <option value="DELIVERED">Delivered to Patient</option>
                  <option value="CANCELLED">Cancelled & Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Courier Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TRK-8829103-MD"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Internal Pharmacy Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on batch validation or delivery conditions..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition"
              >
                Close
              </button>
              <button
                type="button"
                disabled={updateStatusMutation.isPending}
                onClick={() =>
                  updateStatusMutation.mutate({
                    id: selectedOrder._id,
                    status: newStatus,
                    trackingNumber,
                    notes: statusNotes,
                  })
                }
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
