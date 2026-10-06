import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  ShoppingBag,
  Check,
  Heart,
  Eye,
  FileCheck,
} from 'lucide-react';
import { Medicine } from '../../types';
import { MedicineShowcaseItem } from './medicineData';

interface MedicineCardProps {
  product: MedicineShowcaseItem | Medicine;
  onAddToCart: (product: any) => Promise<void>;
  onQuickView: (product: any) => void;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  index?: number;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  isWishlisted,
  onToggleWishlist,
  index = 0,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const unitPrice = product.discountPrice || product.price;
  const originalPrice = product.price > unitPrice ? product.price : (product.price * 1.07);

  const clinicalIndication =
    (product as MedicineShowcaseItem).clinicalIndication ||
    (typeof product.category === 'object' && product.category !== null
      ? (product.category as any).name
      : product.category) ||
    'Healthcare Essential';

  const purchasedCount =
    (product as MedicineShowcaseItem).purchasedCount ||
    `${Math.max(1, Math.round((product.reviewCount || 12) * 14))} Purchased`;

  const rating = product.rating || 4.5;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsAdding(true);
      await onAddToCart(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1800);
    } finally {
      setIsAdding(false);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist(product._id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className="group bg-white rounded-2xl sm:rounded-[22px] border border-slate-100/90 shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:border-emerald-200/70 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Top Image Showcase Box */}
      <div className="relative bg-[#f8faf9] m-2.5 sm:m-3 rounded-xl sm:rounded-2xl p-4 aspect-square flex items-center justify-center overflow-hidden border border-slate-50">
        {/* Prescription pill badge if Rx */}
        {product.requiresPrescription && (
          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-500 text-white shadow-xs flex items-center gap-0.5">
            <FileCheck className="w-2.5 h-2.5" /> Rx
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label="Add to wishlist"
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs hover:bg-white text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
            }`}
          />
        </button>

        {/* Product Image with Hover Zoom */}
        <Link
          to={`/medicines/${product.slug || product._id}`}
          className="w-full h-full flex items-center justify-center"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain max-h-[175px] drop-shadow-sm group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Floating Quick View button on hover */}
        <div className="absolute inset-x-3 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-950 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Info & Action Section */}
      <div className="px-4 pb-4 pt-1 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Rating and Purchased Count */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-800 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {purchasedCount}
            </span>
          </div>

          {/* Clinical Indication / Subcategory */}
          <p className="text-[11px] font-semibold text-emerald-800/70 tracking-wide mt-1 truncate">
            {clinicalIndication}
          </p>

          {/* Product Title */}
          <Link
            to={`/medicines/${product.slug || product._id}`}
            className="block text-sm sm:text-[15px] font-bold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1 mt-0.5"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="pt-2 border-t border-slate-100/80 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              {originalPrice > unitPrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${originalPrice.toFixed(0)}
                </span>
              )}
              <span className="text-base sm:text-lg font-black text-slate-900">
                ${unitPrice.toFixed(0)}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              In Stock
            </span>
          </div>

          {/* Add to Cart Button: dark teal styling matching screenshot */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdding}
            className={`w-full min-h-[38px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all duration-200 active:scale-95 ${
              justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-[#1c534c] hover:bg-[#143e39] text-white shadow-slate-900/10'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Added to cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isAdding ? 'Adding...' : 'Add to cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
