import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowRight,
  ShoppingBag,
  Package,
  Leaf,
  Pill,
  FlaskConical,
  Activity,
  Droplets,
  Baby,
  Stethoscope,
  Dumbbell,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  MedicineShowcaseItem,
  PromoBentoItem,
  CategoryCircleItem,
  CATEGORY_CIRCLES,
  TRENDING_PRODUCTS,
  BENTO_PROMOS,
  GRID_MEDICINES,
} from './medicineData';
import { MedicineCard } from './MedicineCard';
import { MedicineQuickViewModal } from './MedicineQuickViewModal';
import { useCartStore } from '../../store/cartStore';
import { ScrollReveal } from '../scroll';

// Map icon name to Lucide Icon component
const CategoryIcon: React.FC<{ iconName: string; className?: string }> = ({
  iconName,
  className = 'w-6 h-6',
}) => {
  switch (iconName) {
    case 'Package':
      return <Package className={className} />;
    case 'Leaf':
      return <Leaf className={className} />;
    case 'Pill':
      return <Pill className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Baby':
      return <Baby className={className} />;
    case 'Stethoscope':
      return <Stethoscope className={className} />;
    case 'Dumbbell':
      return <Dumbbell className={className} />;
    default:
      return <Package className={className} />;
  }
};

interface ToastNotification {
  id: string;
  title: string;
  image?: string;
  price: number;
}

export const MedicineSection: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, setIsOpen } = useCartStore();

  const [activeCategory, setActiveCategory] = useState<string>('All Products');
  const [quickViewProduct, setQuickViewProduct] = useState<MedicineShowcaseItem | PromoBentoItem | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('medicare_wishlist');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [bentoAddingId, setBentoAddingId] = useState<string | null>(null);
  const [bentoJustAddedId, setBentoJustAddedId] = useState<string | null>(null);

  // Sync wishlist to localStorage
  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('medicare_wishlist', JSON.stringify(Array.from(next)));
      } catch {
        // Ignored
      }
      return next;
    });
  };

  // Add to cart handler
  const handleAddToCart = async (product: MedicineShowcaseItem | PromoBentoItem, quantity: number = 1) => {
    const medId = ('_id' in product ? product._id : product.id) || product.slug;
    const title = 'name' in product ? product.name : product.title;
    const image = 'images' in product ? product.images[0] : product.image;
    const price = product.price;

    try {
      // Add through global store with full product metadata
      await addToCart(product, quantity);
    } catch {
      // Fallback: Ensure cart drawer is opened
      setIsOpen(true);
    }

    // Trigger toast notification
    setToast({
      id: `${medId}-${Date.now()}`,
      title,
      image,
      price,
    });
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Filter lower products grid based on active category
  const filteredGridProducts = GRID_MEDICINES.filter((item) => {
    if (activeCategory === 'All Products') return true;
    return item.categoryTag === activeCategory;
  });

  // Handle bento direct add
  const handleBentoAdd = async (e: React.MouseEvent, promo: PromoBentoItem) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setBentoAddingId(promo.id);
      await handleAddToCart(promo, 1);
      setBentoJustAddedId(promo.id);
      setTimeout(() => setBentoJustAddedId(null), 2000);
    } finally {
      setBentoAddingId(null);
    }
  };

  return (
    <section id="medicines-store" className="w-full bg-[#f8faf9]/50 py-10 sm:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* ========================================================= */}
        {/* 1. TOP HEADER & TRENDING PRODUCTS (MATCHING SCREENSHOT)   */}
        {/* ========================================================= */}
        <div>
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112d26] tracking-tight">
              Trending products <br className="hidden sm:inline" />for you!
            </h2>
            <Link
              to="/medicines"
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1c534c] hover:text-[#112d26] transition-colors"
            >
              <span>See all Product</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* 4 Trending Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {TRENDING_PRODUCTS.map((prod, idx) => (
              <MedicineCard
                key={prod._id}
                product={prod}
                index={idx}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onQuickView={(p) => setQuickViewProduct(p)}
                isWishlisted={wishlist.has(prod._id)}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. PROMOTIONAL BENTO GRID (MATCHING SCREENSHOT)           */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Large Banner: BloodFlow Plus */}
          {(() => {
            const promo = BENTO_PROMOS[0];
            const isAdding = bentoAddingId === promo.id;
            const justAdded = bentoJustAddedId === promo.id;

            return (
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.3 }}
                className={`lg:col-span-7 ${promo.bgGradient} rounded-3xl sm:rounded-[32px] border ${promo.borderClass} p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 min-h-[300px] sm:min-h-[340px]`}
              >
                {/* Top content */}
                <div className="relative z-10 max-w-sm space-y-2">
                  <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-xs text-slate-800 font-extrabold text-[11px] rounded-full shadow-xs">
                    {promo.discountText}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#112d26] tracking-tight">
                    {promo.title}
                  </h3>
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      ${promo.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {promo.subtitle}
                    </span>
                  </div>
                </div>

                {/* Bottom Action buttons */}
                <div className="relative z-10 pt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleBentoAdd(e, promo)}
                    disabled={isAdding}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all duration-200 active:scale-95 ${
                      justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1c534c] hover:bg-[#123934] text-white'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {isAdding ? 'Adding...' : 'Add to cart'}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(promo)}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white/80 hover:bg-white transition-colors border border-slate-200/50 shadow-2xs"
                  >
                    Quick View
                  </button>
                </div>

                {/* Showcase Product Trio Image */}
                <div className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 w-[50%] sm:w-[48%] max-w-[280px] pointer-events-none select-none flex items-end justify-end">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    loading="lazy"
                    className="w-full h-auto object-contain drop-shadow-xl transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>
            );
          })()}

          {/* Right Stacked 2 Banners */}
          <div className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
            {/* Right Top: Hand Sanitizer */}
            {(() => {
              const promo = BENTO_PROMOS[1];
              const isAdding = bentoAddingId === promo.id;
              const justAdded = bentoJustAddedId === promo.id;

              return (
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-1 ${promo.bgGradient} rounded-3xl sm:rounded-[28px] border ${promo.borderClass} p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 min-h-[160px] sm:min-h-[170px]`}
                >
                  <div className="relative z-10 max-w-[60%] space-y-1.5">
                    <span className="inline-block px-2.5 py-0.5 bg-white/90 backdrop-blur-xs text-slate-800 font-extrabold text-[10px] rounded-full shadow-xs">
                      {promo.discountText}
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {promo.title}
                    </h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-black text-slate-900">
                        ${promo.price.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {promo.subtitle}
                      </span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={(e) => handleBentoAdd(e, promo)}
                        disabled={isAdding}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-all ${
                          justAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-950 hover:bg-indigo-900 text-white active:scale-95'
                        }`}
                      >
                        {justAdded ? <Check className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                        <span>{justAdded ? 'Added' : 'Add to cart'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Sanitizer Bottles Image */}
                  <div className="absolute right-2 sm:right-4 bottom-2 top-2 w-[42%] max-w-[150px] pointer-events-none select-none flex items-center justify-end">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      loading="lazy"
                      className="max-h-[140px] w-auto object-contain drop-shadow-md"
                    />
                  </div>
                </motion.div>
              );
            })()}

            {/* Right Bottom: Body Lotion */}
            {(() => {
              const promo = BENTO_PROMOS[2];
              const isAdding = bentoAddingId === promo.id;
              const justAdded = bentoJustAddedId === promo.id;

              return (
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-1 ${promo.bgGradient} rounded-3xl sm:rounded-[28px] border ${promo.borderClass} p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 min-h-[160px] sm:min-h-[170px]`}
                >
                  <div className="relative z-10 max-w-[60%] space-y-1.5">
                    <span className="inline-block px-2.5 py-0.5 bg-white/90 backdrop-blur-xs text-slate-800 font-extrabold text-[10px] rounded-full shadow-xs">
                      {promo.discountText}
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {promo.title}
                    </h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-black text-slate-900">
                        ${promo.price.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {promo.subtitle}
                      </span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={(e) => handleBentoAdd(e, promo)}
                        disabled={isAdding}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-2xs transition-all ${
                          justAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-950 hover:bg-amber-900 text-white active:scale-95'
                        }`}
                      >
                        {justAdded ? <Check className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                        <span>{justAdded ? 'Added' : 'Add to cart'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Lotion Bottles Image */}
                  <div className="absolute right-2 sm:right-4 bottom-2 top-2 w-[42%] max-w-[150px] pointer-events-none select-none flex items-center justify-end">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      loading="lazy"
                      className="max-h-[140px] w-auto object-contain drop-shadow-md"
                    />
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. CATEGORY CIRCLES NAVIGATION BAR (MATCHING SCREENSHOT)  */}
        {/* ========================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Browse Formularies by Healthcare Focus
            </span>
            {activeCategory !== 'All Products' && (
              <button
                type="button"
                onClick={() => setActiveCategory('All Products')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Reset to All ({GRID_MEDICINES.length})
              </button>
            )}
          </div>

          {/* Horizontal scroll container on mobile, wrapped flex on desktop */}
          <div className="relative">
            <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth">
              {CATEGORY_CIRCLES.map((cat) => {
                const isActive = activeCategory === cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.name)}
                    className="flex flex-col items-center group focus:outline-none flex-shrink-0 transition-transform active:scale-95"
                    style={{ width: '84px' }}
                  >
                    {/* Circle Icon Badge */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                        cat.bgColor
                      } ${
                        isActive
                          ? 'ring-3 ring-[#1c534c] ring-offset-2 scale-105 shadow-md'
                          : 'shadow-2xs group-hover:scale-105 group-hover:shadow-sm'
                      }`}
                    >
                      <CategoryIcon
                        iconName={cat.iconName}
                        className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
                          isActive ? 'text-[#1c534c]' : cat.iconColor
                        }`}
                      />
                    </div>

                    {/* Category Label */}
                    <span
                      className={`text-[11px] sm:text-xs text-center mt-2 font-medium leading-tight line-clamp-2 transition-colors ${
                        isActive
                          ? 'text-[#112d26] font-extrabold'
                          : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. MAIN PRODUCT GRID (8 ITEMS MATCHING SCREENSHOT)        */}
        {/* ========================================================= */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#112d26] tracking-tight">
                {activeCategory === 'All Products' ? 'Cardiovascular & Vital Wellness' : activeCategory}
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                {filteredGridProducts.length} items
              </span>
            </div>

            <Link
              to="/medicines"
              className="text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              Browse entire pharmacy catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Grid Container */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredGridProducts.map((prod, idx) => (
                <MedicineCard
                  key={prod._id}
                  product={prod}
                  index={idx}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onQuickView={(p) => setQuickViewProduct(p)}
                  isWishlisted={wishlist.has(prod._id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty state fallback if user filters down to 0 */}
          {filteredGridProducts.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                No items currently found in {activeCategory}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Our licensed pharmaceutical staff regularly replenishes inventory. Explore all items or search by salt name.
              </p>
              <button
                type="button"
                onClick={() => setActiveCategory('All Products')}
                className="px-4 py-2 bg-[#1c534c] hover:bg-[#123934] text-white text-xs font-bold rounded-xl transition"
              >
                View All Formularies
              </button>
            </div>
          )}
        </div>

        {/* View All Medications Catalog CTA footer */}
        <div className="pt-4 text-center">
          <Link
            to="/medicines"
            id="browse-all-pharmacy-btn"
            className="min-h-[46px] inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[#1c534c] hover:bg-[#133c36] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#1c534c]/20 hover:scale-[1.02] active:scale-95"
          >
            <span>Explore Complete Medicare Catalog (1,200+ Products)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Quick View Modal */}
      <MedicineQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? wishlist.has('id' in quickViewProduct ? quickViewProduct.id : quickViewProduct._id) : false}
        onToggleWishlist={toggleWishlist}
      />

      {/* Floating Animated Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-white/10 flex items-center gap-3.5 max-w-md"
          >
            {toast.image ? (
              <img
                src={toast.image}
                alt={toast.title}
                className="w-12 h-12 rounded-xl object-contain bg-white/10 p-1 border border-white/10"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0 pr-2">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block tracking-wider">
                Added to cart
              </span>
              <p className="text-xs font-bold text-white truncate">{toast.title}</p>
              <p className="text-[11px] text-slate-400 font-semibold">${toast.price.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setToast(null);
                setIsOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-colors"
            >
              View Cart
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
