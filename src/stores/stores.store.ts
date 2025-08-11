import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Store } from '@prisma/client';

interface StoresState {
  stores: Store[];
  currentPage: number;
  totalPages: number;
  totalStores: number;
  loading: boolean;
  error: string | null;
}

interface StoresActions {
  setStores: (stores: Store[]) => void;
  addStore: (store: Store) => void;
  updateStore: (id: string, updates: Partial<Store>) => void;
  removeStore: (id: string) => void;
  setPagination: (currentPage: number, totalPages: number, totalStores: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type StoresStore = StoresState & StoresActions;

const initialState: StoresState = {
  stores: [],
  currentPage: 1,
  totalPages: 1,
  totalStores: 0,
  loading: false,
  error: null,
};

export const useStoresStore = create<StoresStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setStores: (stores) => set({ stores }),
      
      addStore: (store) => set((state) => ({
        stores: [...state.stores, store],
        totalStores: state.totalStores + 1,
      })),
      
      updateStore: (id, updates) => set((state) => ({
        stores: state.stores.map((store) =>
          store.id === id ? { ...store, ...updates } : store
        ),
      })),
      
      removeStore: (id) => set((state) => ({
        stores: state.stores.filter((store) => store.id !== id),
        totalStores: state.totalStores - 1,
      })),
      
      setPagination: (currentPage, totalPages, totalStores) =>
        set({ currentPage, totalPages, totalStores }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      reset: () => set(initialState),
    }),
    { name: 'stores-store' }
  )
);