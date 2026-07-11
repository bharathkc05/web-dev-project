import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Must match server-side TAX_RATE in shared/constants/taxConfig.js */
const TAX_RATE = 0.05;

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      outletId: null,
      appliedOffer: null, // { code, discountValue }

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
        set({
          items: remainingItems,
          // Clear outletId if cart becomes empty
          outletId: remainingItems.length === 0 ? null : get().outletId,
          // Clear offer if cart becomes empty (optional logic, but good practice)
          appliedOffer: remainingItems.length === 0 ? null : get().appliedOffer,
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

        set({
          items,
          outletId: items.length === 0 ? null : get().outletId,
          appliedOffer: items.length === 0 ? null : get().appliedOffer,
        });
      },

      clearCart: () => set({ items: [], outletId: null, appliedOffer: null }),

      applyOffer: (code, discountValue) => set({ appliedOffer: { code, discountValue } }),
      
      clearOffer: () => set({ appliedOffer: null }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getTotalItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotals: () => {
        const subtotal = get().getSubtotal();
        const tax = subtotal * TAX_RATE; // Matches server-side TAX_RATE
        
        // Calculate discount based on offer
        let discount = 0;
        const offer = get().appliedOffer;
        if (offer) {
          // If discountValue is percentage vs flat rate? Let's assume flat rate for simplicity, 
          // or if it's < 1 it might be a percentage (e.g., 0.20 for 20%)
          if (offer.discountValue < 1 && offer.discountValue > 0) {
             discount = subtotal * offer.discountValue;
          } else {
             discount = offer.discountValue;
          }
          // Don't allow discount to exceed subtotal
          discount = Math.min(discount, subtotal);
        }

        const total = subtotal + tax - discount;
        
        return { subtotal, tax, discount, total };
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
