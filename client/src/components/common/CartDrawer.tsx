import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export const CartDrawer: React.FC = () => {
  const { items, summary, isOpen, setIsOpen, updateQuantity, removeItem } = useCartStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-800">
                  Cart ({summary.itemCount} items)
                </h2>
              </div>
              <button
                id="cart-drawer-close-btn"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {summary.hasPrescriptionRequiredItems && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Prescription Item(s) Included</span>
                    An approved prescription is required at checkout to fulfill prescription items.
                  </div>
                </div>
              )}

              {items.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-700">Your cart is empty</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Browse our wide selection of authentic medicines and health supplements.
                  </p>
                  <Link
                    to="/medicines"
                    onClick={() => setIsOpen(false)}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
                  >
                    Browse Medicines
                  </Link>
                </div>
              ) : (
                items.map((item, idx) => {
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
                      className="flex gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {image ? (
                          <img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-800 truncate" title={title}>
                            {title}
                          </h4>
                          <button
                            onClick={() => removeItem(medId)}
                            className="text-slate-400 hover:text-rose-500 p-0.5 transition"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {med.strength || 'Standard'} {med.dosageForm ? `• ${med.dosageForm}` : ''}
                        </p>

                        <div className="flex items-center justify-between mt-2.5">
                          {/* Counter */}
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              onClick={() => updateQuantity(medId, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-semibold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(medId, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900">
                              ${(unitPrice * item.quantity).toFixed(2)}
                            </span>
                            {med.discountPrice && med.discountPrice < originalPrice && (
                              <span className="block text-[10px] text-slate-400 line-through">
                                ${(originalPrice * item.quantity).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer summary & Checkout */}
            {items.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/70 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>${summary.subtotal.toFixed(2)}</span>
                  </div>
                  {summary.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-${summary.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery</span>
                    <span>{summary.deliveryFee === 0 ? 'FREE' : `$${summary.deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold text-sm pt-2 border-t border-slate-200">
                    <span>Estimated Total</span>
                    <span>${summary.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Genuine Pharmacy Certified Products</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/cart"
                    id="cart-drawer-view-cart-btn"
                    onClick={() => setIsOpen(false)}
                    className="py-2.5 px-3 text-center border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition"
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/checkout"
                    id="cart-drawer-checkout-btn"
                    onClick={() => setIsOpen(false)}
                    className="py-2.5 px-3 text-center bg-emerald-600 rounded-xl text-xs font-semibold text-white hover:bg-emerald-700 transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    Checkout <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
