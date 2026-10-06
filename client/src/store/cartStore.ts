import { create } from 'zustand';
import { CartResponse, CartSummary, CartItem, Medicine } from '../types';
import { api } from '../api/client';

interface CartState {
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fetchCart: () => Promise<void>;
  addToCart: (productOrId: string | Medicine | any, quantity?: number) => Promise<void>;
  updateQuantity: (medicineId: string, quantity: number) => Promise<void>;
  removeItem: (medicineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const initialSummary: CartSummary = {
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,
  hasPrescriptionRequiredItems: false,
};

export function computeCartSummary(items: CartItem[]): CartSummary {
  let subtotal = 0;
  let totalDiscount = 0;
  let hasPrescriptionRequiredItems = false;
  let itemCount = 0;

  items.forEach((item) => {
    const med: any = item.medicineId;
    if (!med) return;
    const qty = Number(item.quantity) || 1;
    itemCount += qty;

    const originalPrice = Number(med.price ?? item.price ?? 0);
    const discounted = med.discountPrice != null ? Number(med.discountPrice) : (item.discountPrice != null ? Number(item.discountPrice) : originalPrice);
    const effectivePrice = discounted > 0 ? discounted : originalPrice;

    subtotal += originalPrice * qty;
    totalDiscount += Math.max(0, originalPrice - effectivePrice) * qty;

    if (med.requiresPrescription) {
      hasPrescriptionRequiredItems = true;
    }
  });

  const deliveryFee = subtotal > 50 || subtotal === 0 ? 0 : 5.99;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const estimatedTax = Number((taxableAmount * 0.05).toFixed(2));
  const total = Number((taxableAmount + deliveryFee + estimatedTax).toFixed(2));

  return {
    itemCount,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(totalDiscount.toFixed(2)),
    deliveryFee,
    tax: estimatedTax,
    total,
    hasPrescriptionRequiredItems,
  };
}

const STORAGE_KEY = 'medicare_cart';

function loadFromStorage(): { items: CartItem[]; summary: CartSummary } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        return {
          items: parsed.items,
          summary: computeCartSummary(parsed.items),
        };
      }
    }
  } catch (e) {
    console.warn('[CartStore] Failed to read from localStorage:', e);
  }
  return { items: [], summary: initialSummary };
}

function saveToStorage(items: CartItem[]): CartSummary {
  const summary = computeCartSummary(items);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, summary }));
  } catch (e) {
    console.warn('[CartStore] Failed to persist to localStorage:', e);
  }
  return summary;
}

const initialData = loadFromStorage();

export const useCartStore = create<CartState>((set, get) => ({
  items: initialData.items,
  summary: initialData.summary,
  isLoading: false,
  isOpen: false,

  setIsOpen: (isOpen: boolean) => set({ isOpen }),

  fetchCart: async () => {
    // 1. Refresh from localStorage first for instant client state
    const local = loadFromStorage();
    set({ items: local.items, summary: local.summary });

    const token = localStorage.getItem('medicare_token');
    if (!token) return;

    try {
      set({ isLoading: true });
      const res = await api.get<CartResponse>('/cart');

      if (res?.cart?.items && Array.isArray(res.cart.items)) {
        // If server has items, adopt them
        if (res.cart.items.length > 0) {
          const summary = saveToStorage(res.cart.items);
          set({
            items: res.cart.items,
            summary: res.summary || summary,
            isLoading: false,
          });
        } else if (local.items.length > 0) {
          // If server cart was empty but user had guest cart items, sync them up
          for (const itm of local.items) {
            const med: any = itm.medicineId;
            const medId = med?._id || med?.id || med?.slug;
            if (medId) {
              await api.post('/cart/items', { medicineId: medId, quantity: itm.quantity }).catch(() => {});
            }
          }
          const freshRes = await api.get<CartResponse>('/cart').catch(() => null);
          if (freshRes?.cart?.items) {
            const summary = saveToStorage(freshRes.cart.items);
            set({
              items: freshRes.cart.items,
              summary: freshRes.summary || summary,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addToCart: async (productOrId: string | Medicine | any, quantity = 1) => {
    // 1. Identify product data
    let product: any = null;
    let identifier = '';

    if (typeof productOrId === 'object' && productOrId !== null) {
      product = productOrId;
      identifier = product._id || product.id || product.slug || '';
    } else if (typeof productOrId === 'string') {
      identifier = productOrId;
      // Check existing cart items for full object
      const existing = get().items.find((item) => {
        const m: any = item.medicineId;
        return m?._id === identifier || m?.id === identifier || m?.slug === identifier;
      });
      if (existing) {
        product = existing.medicineId;
      }
    }

    if (!product && identifier) {
      product = {
        _id: identifier,
        id: identifier,
        name: identifier.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        price: 25.0,
        discountPrice: 22.0,
        images: ['/images/medicines/cardiocare_bottle.jpg'],
        dosageForm: 'Capsule',
        strength: 'Standard Dosage',
        stock: 100,
        requiresPrescription: false,
      };
    }

    // 2. Optimistic update (Immediate UI feedback)
    const currentItems = [...get().items];
    const matchIndex = currentItems.findIndex((item) => {
      const m: any = item.medicineId;
      if (!m) return false;
      const mId = m._id || m.id || m.slug;
      return (
        mId === identifier ||
        (product?._id && m._id === product._id) ||
        (product?.slug && m.slug === product.slug)
      );
    });

    if (matchIndex > -1) {
      const existing = currentItems[matchIndex];
      currentItems[matchIndex] = {
        ...existing,
        quantity: Number(existing.quantity) + Number(quantity),
        // keep best product details
        medicineId: product || existing.medicineId,
      };
    } else {
      currentItems.push({
        medicineId: product,
        quantity: Number(quantity),
        price: Number(product.price || 0),
        discountPrice: product.discountPrice != null ? Number(product.discountPrice) : undefined,
      });
    }

    const updatedSummary = saveToStorage(currentItems);
    set({
      items: currentItems,
      summary: updatedSummary,
      isOpen: true, // Seamlessly open the cart drawer showing the new item
    });

    // 3. Sync to backend if authenticated
    const token = localStorage.getItem('medicare_token');
    if (token) {
      try {
        const idToSend = product?._id || product?.slug || identifier;
        const res = await api.post<CartResponse>('/cart/items', {
          medicineId: idToSend,
          quantity,
        });
        if (res?.cart?.items && Array.isArray(res.cart.items)) {
          const freshSummary = saveToStorage(res.cart.items);
          set({
            items: res.cart.items,
            summary: res.summary || freshSummary,
          });
        }
      } catch (err) {
        console.warn('[CartStore] Background backend sync notice:', err);
      }
    }
  },

  updateQuantity: async (medicineId: string, quantity: number) => {
    let currentItems = [...get().items];

    if (quantity <= 0) {
      currentItems = currentItems.filter((item) => {
        const m: any = item.medicineId;
        const mId = m?._id || m?.id || m?.slug;
        return mId !== medicineId;
      });
    } else {
      currentItems = currentItems.map((item) => {
        const m: any = item.medicineId;
        const mId = m?._id || m?.id || m?.slug;
        if (mId === medicineId) {
          return { ...item, quantity };
        }
        return item;
      });
    }

    const updatedSummary = saveToStorage(currentItems);
    set({ items: currentItems, summary: updatedSummary });

    const token = localStorage.getItem('medicare_token');
    if (token) {
      try {
        await api.patch(`/cart/items/${medicineId}`, { quantity });
      } catch (err) {
        console.warn('[CartStore] Backend update quantity notice:', err);
      }
    }
  },

  removeItem: async (medicineId: string) => {
    const currentItems = get().items.filter((item) => {
      const m: any = item.medicineId;
      const mId = m?._id || m?.id || m?.slug;
      return mId !== medicineId;
    });

    const updatedSummary = saveToStorage(currentItems);
    set({ items: currentItems, summary: updatedSummary });

    const token = localStorage.getItem('medicare_token');
    if (token) {
      try {
        await api.delete(`/cart/items/${medicineId}`);
      } catch (err) {
        console.warn('[CartStore] Backend remove notice:', err);
      }
    }
  },

  clearCart: async () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
    set({ items: [], summary: initialSummary });

    const token = localStorage.getItem('medicare_token');
    if (token) {
      try {
        await api.delete('/cart');
      } catch (err) {
        console.warn('[CartStore] Backend clear notice:', err);
      }
    }
  },
}));
