import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Must match server-side TAX_RATE in shared/constants/taxConfig.js */
const TAX_RATE = 0.05;

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      outletId: null,
      appliedOffer: null, // { code, type, value, maxDiscount }

      addItem: (product) => {
        const { items, outletId } = get();
        
        // Single outlet rule
        if (items.length > 0 && outletId !== product.outletId) {
          throw new Error('You can only order items from one outlet at a time.');
        }

        const productId = product.id || product._id;
        const existing = items.find((item) => item.id === productId);
        
        if (existing) {
          set({
            items: items.map((item) =>
              item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
        } else {
          set({
            items: [...items, { ...product, id: productId, quantity: 1 }],
            outletId: product.outletId,
          });
        }
      },

      removeItem: (id) => {
        const remainingItems = get().items.filter((item) => item.id !== id);
        const newSubtotal = remainingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const currentOffer = get().appliedOffer;

        set({
          items: remainingItems,
          // Clear outletId if cart becomes empty
          outletId: remainingItems.length === 0 ? null : get().outletId,
          // Clear offer if cart becomes empty or if subtotal drops below minOrderValue
          appliedOffer: (remainingItems.length === 0 || (currentOffer && newSubtotal < currentOffer.minOrderValue)) ? null : currentOffer,
        });
      },

      updateQuantity: (id, change) => {
        const items = get().items
          .map((item) => {
            if (item.id === id) {
              return { ...item, quantity: item.quantity + change };
            }
            return item;
          })
          .filter((item) => item.quantity > 0);

        const newSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const currentOffer = get().appliedOffer;

        set({
          items,
          outletId: items.length === 0 ? null : get().outletId,
          appliedOffer: (items.length === 0 || (currentOffer && newSubtotal < currentOffer.minOrderValue)) ? null : currentOffer,
        });
      },

      clearCart: () => set({ items: [], outletId: null, appliedOffer: null }),

      applyOffer: (offerData) => set({ appliedOffer: offerData }),
      
      clearOffer: () => set({ appliedOffer: null }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTotalItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotals: () => {
        const subtotal = get().getSubtotal();
        
        // Calculate discount based on offer
        let discount = 0;
        const offer = get().appliedOffer;
        if (offer) {
          if (offer.type === 'FLAT') {
            discount = Math.min(offer.value, subtotal);
          } else if (offer.type === 'PERCENT') {
            discount = subtotal * (offer.value / 100);
            if (offer.maxDiscount) {
              discount = Math.min(discount, offer.maxDiscount);
            }
            discount = Math.min(discount, subtotal);
          } else if (offer.type === 'BOGO') {
            const items = get().items;
            const flatPrices = items.flatMap((item) => {
              const qty = item.qty || item.quantity || 0;
              return Array(qty).fill(item.price);
            });
            if (flatPrices.length >= 2) {
              flatPrices.sort((a, b) => a - b);
              const freeCount = Math.floor(flatPrices.length / 2);
              discount = flatPrices.slice(0, freeCount).reduce((sum, price) => sum + price, 0);
              discount = Math.min(discount, subtotal);
            }
          }
        }

        const tax = (subtotal - discount) * TAX_RATE; // Matches server-side TAX_RATE
        const total = subtotal + tax - discount;
        
        return { subtotal, tax, discount, total };
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
