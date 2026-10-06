import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Heart,
  FileCheck,
  Plus,
  Minus,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Medicine } from '../../types';
import { MedicineShowcaseItem, PromoBentoItem } from './medicineData';

interface QuickViewModalProps {
  product: MedicineShowcaseItem | PromoBentoItem | Medicine | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: any, quantity: number) => Promise<void>;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}

export const MedicineQuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const isBento = 'discountText' in product;
  const productId = isBento ? (product as PromoBentoItem).id : (product as Medicine)._id;
  const title = isBento ? (product as PromoBentoItem).title : (product as Medicine).name;
  const image = isBento ? (product as PromoBentoItem).image : (product as Medicine).images?.[0];
  const brand = isBento ? (product as PromoBentoItem).manufacturer : (product as Medicine).brand;
  const packSize = isBento ? (product as PromoBentoItem).packSize : (product as Medicine).packSize;
  const description = product.description;
  const clinicalIndication = isBento
    ? (product as PromoBentoItem).categoryTag
    : (product as any).clinicalIndication ||
      (typeof (product as Medicine).category === 'object' && (product as Medicine).category !== null
        ? ((product as Medicine).category as any).name
        : (product as Medicine).category) ||
      'Healthcare Formulation';
  const rating = isBento ? 4.8 : (product as Medicine).rating || 4.5;
  const purchasedCount = isBento
    ? '5k Purchased'
    : (product as any).purchasedCount ||
      `${Math.max(1, Math.round(((product as Medicine).reviewCount || 10) * 14))} Purchased`;
  const requiresPrescription = product.requiresPrescription;
  const ingredients = !isBento ? (product as Medicine).ingredients : undefined;

  const price = product.price;
  const unitPrice = !isBento && (product as MedicineShowcaseItem).discountPrice ? (product as MedicineShowcaseItem).discountPrice! : price;
  const originalPrice = !isBento && (product as MedicineShowcaseItem).discountPrice ? (product as MedicineShowcaseItem).price : (price * 1.15);

  const handleAdd = async () => {
    try {
      setIsAdding(true);
      await onAddToCart(product, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden z-10 border border-slate-100 my-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
              {/* Image Column */}
              <div className="flex flex-col items-center justify-center bg-[#f8faf9] rounded-2xl p-6 relative border border-slate-100">
                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => onToggleWishlist(productId)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm hover:bg-white text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                    }`}
                  />
                </button>

                <img
                  src={image}
                  alt={title}
                  className="max-h-64 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                />

                {/* Micro trust indicators */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 w-full flex items-center justify-around text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Genuine
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-teal-600" /> Cold-Chain Fast
                  </span>
                </div>
              </div>

              {/* Details Column */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {clinicalIndication || 'Pharmacy Verified'}
                    </span>
                    {requiresPrescription && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <FileCheck className="w-3 h-3" /> Rx Required
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {title}
                  </h3>

                  {brand && (
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      By {brand} · {packSize}
                    </p>
                  )}

                  {/* Rating & Purchased Count */}
                  <div className="flex items-center gap-3 mt-2.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      {purchasedCount}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> In Stock
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                    {description}
                  </p>

                  {/* Active Ingredients Preview if available */}
                  {ingredients && ingredients.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 block mb-1">
                        Key Bio-Actives
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {ingredients.slice(0, 3).map((ing, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price & Actions Box */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      ${unitPrice.toFixed(2)}
                    </span>
                    {originalPrice > unitPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-normal">
                      inclusive of all taxes
                    </span>
                  </div>

                  {/* Quantity Stepper & Add to Cart */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-2 text-xs font-bold text-slate-900 min-w-[28px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={isAdding}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all duration-200 ${
                        justAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#1a4d46] hover:bg-[#133c36] text-white active:scale-95'
                      }`}
                    >
                      {justAdded ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Full Detail Link */}
                  <div className="text-center pt-1">
                    <Link
                      to={`/medicines/${product.slug || productId}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-700 transition-colors"
                    >
                      <span>View full clinical profile & reviews</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
