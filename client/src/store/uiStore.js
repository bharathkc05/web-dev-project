import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isAuthModalOpen: false,
  authModalView: 'login', // 'login' or 'signup'
  
  openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, authModalView: view }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalView: (view) => set({ authModalView: view }),
  
  orderMode: 'delivery', // 'delivery' or 'takeaway'
  toggleOrderMode: () => set((state) => ({ 
    orderMode: state.orderMode === 'delivery' ? 'takeaway' : 'delivery' 
  })),
}));
