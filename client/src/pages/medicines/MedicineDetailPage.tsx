import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Plus,
  Minus,
  Check,
  ArrowRight,
  ArrowLeft,
  Building,
  Info,
} from 'lucide-react';
import { api } from '../../api/client';
import { Medicine } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { LoadingState } from '../../components/common/LoadingState';
import { HealthcareDisclaimer } from '../../components/common/HealthcareDisclaimer';
import { GRID_MEDICINES, TRENDING_PRODUCTS } from '../../components/medicines/medicineData';

export const MedicineDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  // Fetch medicine details
  const { data: apiMedicine, isLoading, isError } = useQuery({
    queryKey: ['medicine', id],
    queryFn: () => api.get<Medicine>(`/medicines/${id}`),
    enabled: !!id,
    retry: 1,
  });

  // Local fallback resolution if backend item not found
  const localFallback = [...GRID_MEDICINES, ...TRENDING_PRODUCTS].find(
    (m) => m._id === id || m.slug === id
  );

  const medicine = apiMedicine || localFallback;

  // Fetch related medicines
  const { data: related } = useQuery({
    queryKey: ['relatedMedicines', medicine?._id || id],
    queryFn: () => api.get<Medicine[]>(`/medicines/${medicine?._id}/related`),
    enabled: !!medicine?._id && !!apiMedicine,
  });

  if (isLoading && !localFallback) {
    return <LoadingState message="Loading medication monograph..." minHeight="min-h-[60vh]" />;
  }

  if (!medicine) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Medicine Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The requested product does not exist or has been discontinued.</p>
        <Link
          to="/medicines"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Pharmacy
        </Link>
      </div>
    );
  }

  const unitPrice = medicine.discountPrice || medicine.price;

  const handleAddToCart = async () => {
    await addToCart(medicine, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = async () => {
    await addToCart(medicine, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-600 transition">Home</Link>
        <span>/</span>
        <Link to="/medicines" className="hover:text-emerald-600 transition">Medicines</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs">{medicine.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: Image Showcase */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          {medicine.requiresPrescription && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-sm">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Prescription Required (Rx)</span>
            </div>
          )}
          {medicine.discountPrice && (
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-sm">
              Save ${(medicine.price - medicine.discountPrice).toFixed(2)}
            </div>
          )}

          <div className="w-full aspect-square max-w-md flex items-center justify-center overflow-hidden rounded-2xl bg-slate-50 p-4">
            {medicine.images?.[0] ? (
              <img
                src={medicine.images[0]}
                alt={medicine.name}
                className="w-full h-full object-contain hover:scale-105 transition duration-300"
              />
            ) : (
              <ShoppingBag className="w-24 h-24 text-slate-300" />
            )}
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>{medicine.brand}</span>
              <span>•</span>
              <span className="text-emerald-600">{medicine.dosageForm}</span>
              <span>•</span>
              <span>SKU: {medicine.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {medicine.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              <strong>Active Generic Ingredient:</strong> {medicine.genericName} ({medicine.strength})
            </p>
          </div>

          {/* Pricing & Stock status */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  ${unitPrice.toFixed(2)}
                </span>
                {medicine.discountPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    ${medicine.price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Pack Size: <strong>{medicine.packSize}</strong>
              </p>
            </div>

            <div>
              {medicine.stock > 0 ? (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  In Stock ({medicine.stock} units)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold inline-flex items-center gap-1.5">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Prescription Alert if Required */}
          {medicine.requiresPrescription && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Prescription Verification Mandatory</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                This item is categorized as a prescription-only drug. You can upload a doctor’s prescription during checkout or from your dashboard. Our licensed pharmacist will review it before dispatch.
              </p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Clinical Overview
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {medicine.description}
            </p>
          </div>

          {/* Quantity Stepper & Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-slate-600 hover:bg-slate-100 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(medicine.stock, quantity + 1))}
                  className="p-2.5 text-slate-600 hover:bg-slate-100 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                id="med-detail-add-cart-btn"
                onClick={handleAddToCart}
                disabled={medicine.stock === 0}
                className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart • ${(unitPrice * quantity).toFixed(2)}
                  </>
                )}
              </button>

              <button
                id="med-detail-buy-now-btn"
                onClick={handleBuyNow}
                disabled={medicine.stock === 0}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-sm disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Clinical Specifications Box */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Manufacturer</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" /> {medicine.manufacturer}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Directions</span>
              <span className="font-medium text-slate-700 max-w-xs text-right">
                {medicine.directions}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Storage Warnings</span>
              <span className="font-medium text-slate-700 max-w-xs text-right">
                {medicine.warnings}
              </span>
            </div>
            {medicine.ingredients && medicine.ingredients.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">Composition</span>
                <span className="font-medium text-slate-700 text-right">
                  {medicine.ingredients.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <HealthcareDisclaimer type="prescription" />

      {/* Related Medicines in Category */}
      {related && related.length > 0 && (
        <section className="space-y-6 pt-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Related Medications in this Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((rel) => (
              <Link
                key={rel._id}
                to={`/medicines/${rel.slug || rel._id}`}
                className="group bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3">
                    <img
                      src={rel.images?.[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300'}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition truncate">
                    {rel.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{rel.strength} • {rel.dosageForm}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    ${(rel.discountPrice || rel.price).toFixed(2)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 group-hover:translate-x-0.5 transition">
                    View →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
