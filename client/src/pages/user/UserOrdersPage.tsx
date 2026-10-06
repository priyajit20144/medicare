import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ArrowRight, Package, Truck, Clock } from 'lucide-react';
import { api } from '../../api/client';
import { Order } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const UserOrdersPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['myOrders', statusFilter],
    queryFn: () => api.get<{ orders: Order[]; pagination: any }>('/orders/my', { status: statusFilter || undefined }),
  });

  const orders = response?.orders || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Pharmacy Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your medication dispatches, delivery statuses, and invoices.
          </p>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        >
          <option value="">All Orders</option>
          <option value="PROCESSING">Processing</option>
          <option value="PHARMACY_REVIEW">Pharmacy Review</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Found"
          description="You haven’t placed any medicine orders yet or no orders match your filter."
          actionText="Browse Medicines"
          actionLink="/medicines"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={ord.status} />
                  <span className="font-black text-sm text-slate-900">
                    ${ord.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items preview */}
              <div className="space-y-2">
                {ord.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium text-slate-800 truncate max-w-sm">
                      {item.name} <span className="text-slate-400">× {item.quantity}</span>
                    </span>
                    <span>${((item.discountPrice || item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tracking: {ord.trackingNumber || 'Pending Dispatch'}</span>
                </div>

                <Link
                  to={`/user/orders/${ord._id}`}
                  className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 transition"
                >
                  Order Details & Tracking <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
