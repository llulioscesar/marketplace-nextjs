import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Interfaces para filtros
export interface OrderFilters {
  searchQuery: string;
  statusFilter: string;
  storeFilter: string;
  dateRange: { startDate: string; endDate: string };
}

export interface StoreFilters {
  searchQuery: string;
  showActiveOnly: boolean;
}

export interface ProductFilters {
  searchQuery: string;
  categoryFilter: string;
  storeFilter: string;
  showActiveOnly: boolean;
}

// Estado del store
interface BusinessState {
  // UI Preferences
  ordersViewMode: 'grid' | 'list';
  storesViewMode: 'grid' | 'list';
  productsViewMode: 'grid' | 'list';
  
  // Pagination
  ordersItemsPerPage: number;
  storesItemsPerPage: number;
  productsItemsPerPage: number;
  
  // Filtros - estos NO se persisten para mejor UX
  ordersFilters: OrderFilters;
  storesFilters: StoreFilters;
  productsFilters: ProductFilters;
  
  // Actions - UI Preferences
  setOrdersViewMode: (mode: 'grid' | 'list') => void;
  setStoresViewMode: (mode: 'grid' | 'list') => void;
  setProductsViewMode: (mode: 'grid' | 'list') => void;
  
  // Actions - Pagination
  setOrdersItemsPerPage: (count: number) => void;
  setStoresItemsPerPage: (count: number) => void;
  setProductsItemsPerPage: (count: number) => void;
  
  // Actions - Filtros
  setOrdersFilters: (filters: Partial<OrderFilters>) => void;
  setStoresFilters: (filters: Partial<StoreFilters>) => void;
  setProductsFilters: (filters: Partial<ProductFilters>) => void;
  
  // Reset functions
  resetOrdersFilters: () => void;
  resetStoresFilters: () => void;
  resetProductsFilters: () => void;
}

// Valores por defecto
const defaultOrderFilters: OrderFilters = {
  searchQuery: '',
  statusFilter: '',
  storeFilter: '',
  dateRange: { startDate: '', endDate: '' }
};

const defaultStoreFilters: StoreFilters = {
  searchQuery: '',
  showActiveOnly: true
};

const defaultProductFilters: ProductFilters = {
  searchQuery: '',
  categoryFilter: '',
  storeFilter: '',
  showActiveOnly: true
};

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      // Initial state - UI Preferences (persisted)
      ordersViewMode: 'list',
      storesViewMode: 'list', 
      productsViewMode: 'list',
      
      // Initial state - Pagination (persisted)
      ordersItemsPerPage: 12,
      storesItemsPerPage: 6,
      productsItemsPerPage: 12,
      
      // Initial state - Filtros (NOT persisted)
      ordersFilters: defaultOrderFilters,
      storesFilters: defaultStoreFilters,
      productsFilters: defaultProductFilters,
      
      // Actions - UI Preferences
      setOrdersViewMode: (mode) => set({ ordersViewMode: mode }),
      setStoresViewMode: (mode) => set({ storesViewMode: mode }),
      setProductsViewMode: (mode) => set({ productsViewMode: mode }),
      
      // Actions - Pagination  
      setOrdersItemsPerPage: (count) => set({ ordersItemsPerPage: count }),
      setStoresItemsPerPage: (count) => set({ storesItemsPerPage: count }),
      setProductsItemsPerPage: (count) => set({ productsItemsPerPage: count }),
      
      // Actions - Filtros
      setOrdersFilters: (filters) => set((state) => ({
        ordersFilters: { ...state.ordersFilters, ...filters }
      })),
      setStoresFilters: (filters) => set((state) => ({
        storesFilters: { ...state.storesFilters, ...filters }
      })),
      setProductsFilters: (filters) => set((state) => ({
        productsFilters: { ...state.productsFilters, ...filters }
      })),
      
      // Reset functions
      resetOrdersFilters: () => set({ ordersFilters: defaultOrderFilters }),
      resetStoresFilters: () => set({ storesFilters: defaultStoreFilters }),
      resetProductsFilters: () => set({ productsFilters: defaultProductFilters }),
    }),
    {
      name: 'business-preferences',
      // Solo persistir las preferencias de UI, no los filtros
      partialize: (state) => ({
        ordersViewMode: state.ordersViewMode,
        storesViewMode: state.storesViewMode,
        productsViewMode: state.productsViewMode,
        ordersItemsPerPage: state.ordersItemsPerPage,
        storesItemsPerPage: state.storesItemsPerPage,
        productsItemsPerPage: state.productsItemsPerPage,
      }),
    }
  )
);