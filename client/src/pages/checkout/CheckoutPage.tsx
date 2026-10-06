import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  FileCheck,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Check,
  Lock,
  PackageCheck,
  Sparkles,
  RefreshCw,
  Plus,
  Zap,
} from 'lucide-react';
import { api } from '../../api/client';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { Prescription } from '../../types';

export const CheckoutPage: React.FC = () => {
  const { items, summary, clearCart, fetchCart, isLoading, addToCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.fullName || 'shreyas roy',
    phone: user?.phone || '8768508264',
    addressLine1: '450 West 42nd Street, Apt 18B',
    addressLine2: '',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700001',
    country: 'India',
  });

  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<'mock' | 'cod'>('cod');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [addingQuickItem, setAddingQuickItem] = useState<string | null>(null);

  // Sync cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Fetch user's approved/available prescriptions if cart requires Rx
  const { data: prescriptionsData } = useQuery({
    queryKey: ['myPrescriptions'],
    queryFn: () => api.get<{ prescriptions: Prescription[] }>('/prescriptions/my'),
    enabled: summary.hasPrescriptionRequiredItems,
  });

  useEffect(() => {
    if (prescriptionsData?.prescriptions && prescriptionsData.prescriptions.length > 0) {
      const approved = prescriptionsData.prescriptions.find((p) => p.status === 'APPROVED');
      if (approved) {
        setSelectedPrescriptionId(approved._id);
      } else {
        setSelectedPrescriptionId(prescriptionsData.prescriptions[0]._id);
      }
    }
  }, [prescriptionsData]);

  const handleQuickAdd = async (product: any) => {
    try {
      setAddingQuickItem(product.slug || product._id);
      await addToCart(product, 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to add item to checkout.');
    } finally {
      setAddingQuickItem(null);
    }
  };

  // 1. Loading State while syncing cart from MongoDB
  if (isLoading && items.length === 0) {
    return (
      <div className="w-full bg-[#f8faf9]/50 min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shadow-sm">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Verifying Clinical Cart...
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Synchronizing items, clinical pricing, and prescription requirements from the healthcare database.
        </p>
      </div>
    );
  }

  // 2. Empty State with 1-Click Quick Add & Demo Order Options
  if (items.length === 0) {
    const quickItems = [
      {
        _id: '6abd6da9e9e7e2d492855374',
        slug: 'heartease-solution',
        name: 'HeartEase Solution',
        dosageForm: 'Botanical Tincture',
        strength: '30ml Dropper',
        price: 75,
        discountPrice: 70,
        images: ['/images/medicines/heartease_herbal.jpg'],
        requiresPrescription: false,
        stock: 94,
      },
      {
        _id: '6abc4034e9e7e2d4928549a0',
        slug: 'ibuprofen-400mg',
        name: 'Ibuprofen Extra Strength 400mg',
        dosageForm: 'Softgel',
        strength: '400mg',
        price: 12.99,
        discountPrice: 9.99,
        images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400'],
        requiresPrescription: false,
        stock: 100,
      },
      {
        _id: '6abc4034e9e7e2d4928549a1',
        slug: 'paracetamol-500mg',
        name: 'Paracetamol & Acetaminophen 500mg',
        dosageForm: 'Tablet',
        strength: '500mg',
        price: 8.5,
        discountPrice: 6.99,
        images: ['https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=400'],
        requiresPrescription: false,
        stock: 100,
      },
    ];

    return (
      <div className="w-full bg-[#f8faf9]/50 min-h-screen py-8 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Status Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Your Clinical Cart is Empty
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                If you just authorized an order, your items were safely cleared and routed to the pharmacy dispatch center. Add an item below to review the responsive checkout experience.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                id="quick-demo-order-btn"
                onClick={() => handleQuickAdd(quickItems[0])}
                disabled={addingQuickItem != null}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
              >
                <Zap className="w-4 h-4 text-emerald-300" />
                {addingQuickItem === quickItems[0].slug ? 'Loading Checkout...' : '⚡ 1-Click Demo Patient Order'}
              </button>

              <Link
                to="/medicines"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition"
              >
                Browse Medicines <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick-Add Carousel / Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Quick-Add Healthcare Essentials
                </h3>
                <p className="text-xs text-slate-500">
                  Select a certified OTC medicine to test the responsive clinical checkout layout.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {quickItems.map((prod) => (
                <div
                  key={prod.slug}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition"
                >
                  <div className="space-y-2.5">
                    <div className="h-28 w-full rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {prod.dosageForm} • {prod.strength}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black text-emerald-700">
                        ${prod.discountPrice.toFixed(2)}
                      </span>
                      {prod.price > prod.discountPrice && (
                        <span className="text-[10px] text-slate-400 line-through ml-1.5">
                          ${prod.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      id={`add-quick-${prod.slug}`}
                      onClick={() => handleQuickAdd(prod)}
                      disabled={addingQuickItem != null}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {addingQuickItem === prod.slug ? 'Adding...' : 'Add & Test'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (summary.hasPrescriptionRequiredItems && !selectedPrescriptionId) {
      setError('Your cart contains prescription items. Please select or attach an approved prescription document.');
      return;
    }

    setSubmitting(true);
    try {
      // Build safe item list to ensure backend never receives empty cart
      const payloadItems = items.map((i) => {
        const med: any = (typeof i.medicineId === 'object' && i.medicineId !== null)
          ? i.medicineId
          : (i as any).product || i;
        return {
          medicineId: med?._id || (med as any)?.id || (med as any)?.slug,
          quantity: i.quantity,
          price: i.price || med?.price,
          discountPrice: i.discountPrice || med?.discountPrice,
        };
      });

      const order = await api.post<any>('/orders', {
        shippingAddress: address,
        prescriptionId: selectedPrescriptionId || undefined,
        paymentMethod: paymentProvider,
        notes,
        items: payloadItems,
      });

      // Clear local cart
      await clearCart();

      // Navigate to order detail page
      navigate(`/user/orders/${order._id}?success=true`);
    } catch (err: any) {
      setError(err.message || 'Could not place order. Please review your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#f8faf9]/50 min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Navigation Breadcrumb & Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/cart" className="hover:text-emerald-700 transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
            </Link>
            <span>/</span>
            <span className="text-emerald-700 font-bold">Secure Checkout</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Clinical Checkout & Verification
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Provide your delivery details, verify medical prescription, and review your order.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted Healthcare Checkout</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MOBILE ORDER SUMMARY ACCORDION (Visible on screens < 1024px) */}
        {/* ========================================================= */}
        <div className="lg:hidden bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
            className="w-full px-4 py-3.5 flex items-center justify-between text-left bg-slate-50/70 hover:bg-slate-100 transition"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">
                  {mobileSummaryOpen ? 'Hide order summary' : 'Show order summary'} ({summary.itemCount} items)
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Tap to review medications & breakdown
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">
                ${summary.total.toFixed(2)}
              </span>
              {mobileSummaryOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </button>

          {mobileSummaryOpen && (
            <div className="p-4 border-t border-slate-200 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {items.map((item, idx) => {
                  const med: any = (typeof item.medicineId === 'object' && item.medicineId !== null)
                    ? item.medicineId
                    : (item as any).product || item;
                  if (!med) return null;

                  const medId = med._id || med.id || med.slug || `m-item-${idx}`;
                  const unitPrice = Number(med.discountPrice != null && med.discountPrice > 0 ? med.discountPrice : (med.price || item.price || 0));
                  const title = med.name || med.title || 'Healthcare Medicine';
                  const image = med.images?.[0] || med.image;

                  return (
                    <div key={medId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {image ? (
                            <img src={image} alt={title} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{title}</p>
                          <p className="text-[11px] text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 flex-shrink-0">
                        ${(unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${summary.subtotal.toFixed(2)}</span>
                </div>
                {summary.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-${summary.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  <span>{summary.deliveryFee === 0 ? 'FREE' : `$${summary.deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span>${summary.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="text-emerald-700">${summary.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-2xl flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 font-semibold">{error}</div>
          </div>
        )}

        {/* Main Form & Sticky Summary Grid */}
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ========================================================= */}
          {/* LEFT COLUMN: Delivery, Prescription & Payment (8 cols)    */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">

            {/* 1. Delivery Address Card */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  Delivery Address
                </h2>
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Cold-Chain Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Recipient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    placeholder="e.g. +1 555-019-2834"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Street Address & Apartment <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    placeholder="Flat/House number, Street, Landmark"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="City / Town"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    State / Province <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    placeholder="State or Region"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Postal / PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    placeholder="Postal code"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Country</label>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* 2. Prescription Verification Card */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  Prescription Attachment
                </h2>
                {summary.hasPrescriptionRequiredItems ? (
                  <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" /> Rx Required
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Optional for OTC items
                  </span>
                )}
              </div>

              {summary.hasPrescriptionRequiredItems ? (
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    One or more items in your cart require a licensed prescription. Please select an approved prescription from your account:
                  </p>

                  {prescriptionsData?.prescriptions && prescriptionsData.prescriptions.length > 0 ? (
                    <div className="space-y-2.5">
                      {prescriptionsData.prescriptions.map((rx) => (
                        <label
                          key={rx._id}
                          className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                            selectedPrescriptionId === rx._id
                              ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="prescriptionChoice"
                            checked={selectedPrescriptionId === rx._id}
                            onChange={() => setSelectedPrescriptionId(rx._id)}
                            className="mt-1 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <div className="flex-1 text-xs sm:text-sm min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900 truncate">
                                Patient: {rx.patientName} {rx.doctorName && `• Dr. ${rx.doctorName}`}
                              </span>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-white border border-slate-200 text-slate-700 flex-shrink-0">
                                {rx.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-slate-500 text-xs mt-0.5">
                              {rx.notes || 'Physician certified prescription'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-3">
                      <p className="text-xs sm:text-sm text-amber-900 font-bold">
                        No prescription documents found on your account.
                      </p>
                      <Link
                        to="/prescriptions/upload"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        <FileCheck className="w-4 h-4" /> Upload Prescription (Opens in new tab)
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    All items in your cart are authentic Over-The-Counter (OTC) wellness medications. No doctor prescription is required.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Payment Method Card */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  Payment Method
                </h2>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Zero Surcharge
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentProvider === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    value="cod"
                    checked={paymentProvider === 'cod'}
                    onChange={() => setPaymentProvider('cod')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div className="text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span className="font-extrabold text-slate-900">
                        Pay on Delivery (COD)
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs mt-1 block">
                      Pay via cash, UPI, or card upon courier receipt at your doorstep.
                    </span>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition ${
                    paymentProvider === 'mock'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentProvider"
                    value="mock"
                    checked={paymentProvider === 'mock'}
                    onChange={() => setPaymentProvider('mock')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div className="text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="font-extrabold text-slate-900">
                        Instant Sandbox (Test Mode)
                      </span>
                    </div>
                    <span className="text-slate-500 text-xs mt-1 block">
                      Instant digital simulated payment. No real credit card charged.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Desktop Sticky Order Summary (4-5 cols)     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" /> Order Summary
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {summary.itemCount} items
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const med: any = (typeof item.medicineId === 'object' && item.medicineId !== null)
                    ? item.medicineId
                    : (item as any).product || item;
                  if (!med) return null;

                  const medId = med._id || med.id || med.slug || `checkout-item-${idx}`;
                  const unitPrice = Number(med.discountPrice != null && med.discountPrice > 0 ? med.discountPrice : (med.price || item.price || 0));
                  const title = med.name || med.title || 'Healthcare Medicine';
                  const image = med.images?.[0] || med.image;

                  return (
                    <div key={medId} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {image ? (
                            <img src={image} alt={title} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate" title={title}>
                            {title}
                          </p>
                          <span className="text-[11px] text-slate-500 block">
                            Qty: <strong className="text-slate-800">{item.quantity}</strong>
                          </span>
                        </div>
                      </div>

                      <span className="font-black text-slate-900 flex-shrink-0">
                        ${(unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs sm:text-sm pt-4 border-t border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-800">${summary.subtotal.toFixed(2)}</span>
                </div>

                {summary.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Healthcare Savings</span>
                    <span>-${summary.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Cold-Chain Express Delivery</span>
                  <span className="font-bold text-emerald-700">
                    {summary.deliveryFee === 0 ? 'FREE' : `$${summary.deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Estimated Clinical Tax</span>
                  <span className="font-semibold text-slate-800">${summary.tax.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-900">
                  <span className="text-sm sm:text-base">Grand Total</span>
                  <span className="text-2xl sm:text-3xl text-emerald-700 tracking-tight">
                    ${summary.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                id="checkout-confirm-order-btn"
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 sm:py-4 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Authorizing Order...</span>
                ) : (
                  <>
                    <span>Authorize & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Genuine Pharmacy Certified Products</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Inspected by Board-Certified Pharmacists before dispatch
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
