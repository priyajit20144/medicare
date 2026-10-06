import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';

export const CartPage: React.FC = () => {
  const { items, summary, isLoading, fetchCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && items.length === 0) {
    return <LoadingState message="Fetching your current cart items..." minHeight="min-h-[50vh]" />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          description="You don't have any items in your cart yet. Explore our genuine medicines and healthcare products."
          actionText="Browse Medicines"
          actionLink="/medicines"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart ({summary.itemCount} Items)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected medications before proceeding to clinical checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      {/* Prescription Requirement Alert */}
      {summary.hasPrescriptionRequiredItems && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="font-bold block text-amber-950 mb-0.5">
              Prescription Items in Cart
            </strong>
            One or more items in your cart require a valid prescription. You will be asked to select or upload an approved prescription at checkout. Our pharmacists will review it prior to shipment.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => {
            const med: any = (typeof item.medicineId === 'object' && item.medicineId !== null)
              ? item.medicineId
              : (item as any).product || item;
            if (!med) return null;

            const medId = med._id || med.id || med.slug || `cart-item-${idx}`;
            const unitPrice = Number(med.discountPrice != null && med.discountPrice > 0 ? med.discountPrice : (med.price || item.price || 0));
            const originalPrice = Number(med.price || item.price || unitPrice);
            const title = med.name || med.title || 'Healthcare Medicine';
            const image = med.images?.[0] || med.image;

            return (
              <div
                key={medId}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {image ? (
                      <img src={image} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {med.brand || 'Medicare Certified'}
                      </span>
                      {med.requiresPrescription && (
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                          Rx
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/medicines/${med.slug || med._id || medId}`}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition block"
                    >
                      {title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {med.strength || 'Standard'} {med.dosageForm ? `• ${med.dosageForm}` : ''} {med.packSize ? `(${med.packSize})` : ''}
                    </p>
                    <div className="text-xs font-bold text-slate-900 mt-2 sm:hidden">
                      ${(unitPrice * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Counter & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(medId, item.quantity - 1)}
                      className="p-2 text-slate-600 hover:bg-slate-200 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(medId, item.quantity + 1)}
                      className="p-2 text-slate-600 hover:bg-slate-200 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="hidden sm:block text-right min-w-[80px]">
                    <div className="text-sm font-extrabold text-slate-900">
                      ${(unitPrice * item.quantity).toFixed(2)}
                    </div>
                    {med.discountPrice && med.discountPrice < originalPrice && (
                      <div className="text-[11px] text-slate-400 line-through">
                        ${(originalPrice * item.quantity).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeItem(medId)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <Link
            to="/medicines"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition pt-2"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping For Medicines
          </Link>
        </div>

        {/* Order Summary Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Total ({summary.itemCount})</span>
              <span>${summary.subtotal.toFixed(2)}</span>
            </div>

            {summary.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Promotional Discount</span>
                <span>-${summary.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                Delivery Fee
              </span>
              <span>
                {summary.deliveryFee === 0 ? (
                  <strong className="text-emerald-600 font-bold">FREE</strong>
                ) : (
                  `$${summary.deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (5%)</span>
              <span>${summary.tax.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Due</span>
              <span className="text-2xl font-black text-slate-900">
                ${summary.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/checkout"
              id="cart-proceed-checkout-btn"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              Proceed to Clinical Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Medicare Guarantee</span>
            </div>
            <p>
              100% authentic medications dispensed by licensed clinical pharmacists. Free return on damaged or unsealed packaging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
