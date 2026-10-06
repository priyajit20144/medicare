import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Package,
  Leaf,
  Pill,
  FlaskConical,
  Activity,
  Droplets,
  Baby,
  Stethoscope,
  Dumbbell,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';
import { Medicine } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { LoadingState } from '../../components/common/LoadingState';
import {
  MedicineShowcaseItem,
  PromoBentoItem,
  CATEGORY_CIRCLES,
  TRENDING_PRODUCTS,
  BENTO_PROMOS,
  GRID_MEDICINES,
} from '../../components/medicines/medicineData';
import { MedicineCard } from '../../components/medicines/MedicineCard';
import { MedicineQuickViewModal } from '../../components/medicines/MedicineQuickViewModal';

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

export const MedicinesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, setIsOpen } = useCartStore();

  const search = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const requiresPrescription = searchParams.get('requiresPrescription') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [activeCategoryName, setActiveCategoryName] = useState<string>('All Products');
  const [quickViewProduct, setQuickViewProduct] = useState<MedicineShowcaseItem | PromoBentoItem | Medicine | null>(null);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [bentoAddingId, setBentoAddingId] = useState<string | null>(null);
  const [bentoJustAddedId, setBentoJustAddedId] = useState<string | null>(null);

  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('medicare_wishlist');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

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

  // Sync categoryParam to activeCategoryName
  useEffect(() => {
    if (!categoryParam || categoryParam === 'all') {
      setActiveCategoryName('All Products');
    } else {
      const matched = CATEGORY_CIRCLES.find((c) => c.slug === categoryParam);
      if (matched) {
        setActiveCategoryName(matched.name);
      }
    }
  }, [categoryParam]);

  // Fetch medicines from backend API
  const { data: medicinesResponse, isLoading } = useQuery({
    queryKey: ['medicines', { search, category: categoryParam, requiresPrescription, sort, page }],
    queryFn: () =>
      api.get<{ medicines: Medicine[]; pagination: any }>('/medicines', {
        search,
        category: categoryParam && categoryParam !== 'all' ? categoryParam : undefined,
        requiresPrescription: requiresPrescription || undefined,
        sort,
        page,
        limit: 16,
      }),
  });

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleCategoryClick = (catName: string, catSlug: string) => {
    setActiveCategoryName(catName);
    if (catSlug === 'all') {
      updateParam('category', null);
    } else {
      updateParam('category', catSlug);
    }
  };

  const handleAddToCart = async (product: any, quantity: number = 1) => {
    const medId = product._id || product.id || product.slug;
    const title = product.name || product.title;
    const image = product.images?.[0] || product.image;
    const price = product.discountPrice || product.price;

    try {
      await addToCart(product, quantity);
    } catch {
      setIsOpen(true);
    }

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

  // Bento direct add
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

  // Compile rich catalog items with category and search filter
  const allCuratedList = [...GRID_MEDICINES, ...TRENDING_PRODUCTS];

  const filteredCuratedList = allCuratedList.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      const matchText =
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.brand.toLowerCase().includes(q) ||
        m.clinicalIndication.toLowerCase().includes(q);
      if (!matchText) return false;
    }

    if (activeCategoryName !== 'All Products') {
      if (m.categoryTag !== activeCategoryName) return false;
    }

    if (requiresPrescription === 'true' && !m.requiresPrescription) return false;
    if (requiresPrescription === 'false' && m.requiresPrescription) return false;

    return true;
  });

  // Resilient display list: If API returns items matching current filters, use them; otherwise fallback to curated items
  const apiItems = medicinesResponse?.medicines || [];
  const displayItems = apiItems.length > 0 && !search && activeCategoryName === 'All Products' && !requiresPrescription
    ? apiItems
    : filteredCuratedList;

  return (
    <div className="w-full bg-[#f8faf9]/50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">

        {/* ========================================================= */}
        {/* 1. TOP HEADER & TRENDING PRODUCTS (MATCHING SCREENSHOT)   */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                Medicare Certified Pharmacy
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#112d26] tracking-tight">
                Trending products <br className="hidden sm:inline" />for you!
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveCategoryName('All Products');
                setSearchParams({});
                window.scrollTo({ top: 900, behavior: 'smooth' });
              }}
              className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1c534c] hover:text-[#112d26] transition-colors"
            >
              <span>See all Product</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
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

                <div className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 w-[50%] sm:w-[48%] max-w-[280px] pointer-events-none select-none flex items-end justify-end">
                  <img
                    src={promo.image}
                    alt={promo.title}
                    loading="lazy"
                    className="w-full h-auto object-contain drop-shadow-xl"
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
            {activeCategoryName !== 'All Products' && (
              <button
                type="button"
                onClick={() => handleCategoryClick('All Products', 'all')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Reset to All Products
              </button>
            )}
          </div>

          <div className="relative">
            <div className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth">
              {CATEGORY_CIRCLES.map((cat) => {
                const isActive = activeCategoryName === cat.name;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.name, cat.slug)}
                    className="flex flex-col items-center group focus:outline-none flex-shrink-0 transition-transform active:scale-95"
                    style={{ width: '84px' }}
                  >
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
        {/* 4. SEARCH, FILTER & SORT TOOLBAR                          */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="medicines-search-input"
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value || null)}
              placeholder="Search by name, brand, active salt..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => updateParam('search', null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Prescription Pills & Sort */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => updateParam('requiresPrescription', null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  !requiresPrescription
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => updateParam('requiresPrescription', 'false')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  requiresPrescription === 'false'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                OTC (No Rx)
              </button>
              <button
                type="button"
                onClick={() => updateParam('requiresPrescription', 'true')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  requiresPrescription === 'true'
                    ? 'bg-white text-amber-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rx Required
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <select
                id="medicines-sort-select"
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="newest">Newest Additions</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. MAIN PRODUCT GRID (MATCHING SCREENSHOT)                */}
        {/* ========================================================= */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#112d26] tracking-tight">
                {activeCategoryName === 'All Products' ? 'Prescription & Daily Formularies' : activeCategoryName}
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                {displayItems.length} products
              </span>
            </div>

            {(search || requiresPrescription || activeCategoryName !== 'All Products') && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategoryName('All Products');
                  setSearchParams({});
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
              >
                Clear all filters
              </button>
            )}
          </div>

          {isLoading && displayItems.length === 0 ? (
            <LoadingState message="Loading certified medicine inventory..." />
          ) : displayItems.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">No Medications Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No products match your criteria. Try clearing search or choosing another clinical category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategoryName('All Products');
                  setSearchParams({});
                }}
                className="px-4 py-2 bg-[#1c534c] hover:bg-[#123934] text-white text-xs font-bold rounded-xl transition"
              >
                View Full Formularies
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {displayItems.map((med, idx) => (
                  <MedicineCard
                    key={med._id || (med as any).id || idx}
                    product={med}
                    index={idx}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    isWishlisted={wishlist.has(med._id || (med as any).id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination when API has multiple pages */}
          {medicinesResponse?.pagination && medicinesResponse.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="text-xs font-semibold text-slate-600 px-3">
                Page {page} of {medicinesResponse.pagination.totalPages}
              </span>
              <button
                disabled={page >= medicinesResponse.pagination.totalPages}
                onClick={() => updateParam('page', String(page + 1))}
                className="p-2 border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Quick View Modal */}
      <MedicineQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? wishlist.has('id' in quickViewProduct ? (quickViewProduct as any).id : (quickViewProduct as any)._id) : false}
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
    </div>
  );
};
