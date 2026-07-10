import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOutletStore = create(
  persist(
    (set) => ({
      selectedOutlet: null,
      
      setSelectedOutlet: (outlet) => set({ selectedOutlet: outlet }),
      
      clearSelectedOutlet: () => set({ selectedOutlet: null }),
    }),
    {
      name: 'outlet-storage',
    }
  )
);
