import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { api } from '../../api/client';
import { Order } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';

export const UserOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['orderDetail', id],
    queryFn: () => api.get<Order>(`/orders/${id}`),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => api.patch(`/orders/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderDetail', id] });
    },
  });

  if (isLoading) {
    return <LoadingState message="Loading order details..." minHeight="min-h-[50vh]" />;
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-800">Order Not Found</h2>
        <Link to="/user/orders" className="text-xs text-emerald-600 font-semibold mt-2 inline-block">
          ← Return to Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { title: 'Order Placed', status: 'PAID' },
    { title: 'Pharmacy Review', status: 'PHARMACY_REVIEW' },
    { title: 'Processing & Packed', status: 'PROCESSING' },
    { title: 'Dispatched / In Transit', status: 'SHIPPED' },
    { title: 'Delivered', status: 'DELIVERED' },
  ];

  const getStepIndex = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING_PAYMENT':
        return 0;
      case 'PAID':
        return 1;
      case 'PHARMACY_REVIEW':
        return 1;
      case 'PROCESSING':
      case 'READY_TO_SHIP':
        return 2;
      case 'SHIPPED':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.status);
  const isCancelled = ['CANCELLED', 'REFUNDED'].includes(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <Link to="/user/orders" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-slate-500">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Visual Tracking Stepper */}
      {!isCancelled ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Fulfillment Journey
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Tracking: <strong>{order.trackingNumber || 'Pending'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {steps.map((st, i) => {
              const isPast = i <= currentStep;
              return (
                <div key={i} className="flex flex-col items-center text-center space-y-1.5 p-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                      isPast
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${
                      isPast ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>This order was cancelled. Restocked to pharmacy inventory.</span>
        </div>
      )}

      {/* Grid: Order Items & Delivery Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Ordered Medications ({order.items?.length || 0})
          </h2>

          <div className="space-y-3 divide-y divide-slate-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">{item.name}</h4>
                  <span className="text-[11px] text-slate-400">
                    SKU: {item.sku} • Qty: {item.quantity}
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  ${((item.discountPrice || item.price) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Invoicing */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Address
            </h3>
            <div className="space-y-1 text-slate-600">
              <p className="font-bold text-slate-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-[11px] text-slate-400 pt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">
              Financial Invoice Summary
            </h3>
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : `$${order.deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
              <span>Total Paid</span>
              <span>${order.total.toFixed(2)}</span>
            </div>

            {/* Cancel Button if eligible */}
            {['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PHARMACY_REVIEW'].includes(order.status) && (
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="w-full mt-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
