import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Product } from '@prisma/client';

interface ProductsState {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  loading: boolean;
  error: string | null;
  selectedStoreSlug: string | null;
}

interface ProductsActions {
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setPagination: (currentPage: number, totalPages: number, totalProducts: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedStoreSlug: (slug: string | null) => void;
  reset: () => void;
}

type ProductsStore = ProductsState & ProductsActions;

const initialState: ProductsState = {
  products: [],
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  loading: false,
  error: null,
  selectedStoreSlug: null,
};

export const useProductsStore = create<ProductsStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      setProducts: (products) => set({ products }),
      
      addProduct: (product) => set((state) => ({
        products: [...state.products, product],
        totalProducts: state.totalProducts + 1,
      })),
      
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...updates } : product
        ),
      })),
      
      removeProduct: (id) => set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        totalProducts: state.totalProducts - 1,
      })),
      
      setPagination: (currentPage, totalPages, totalProducts) =>
        set({ currentPage, totalPages, totalProducts }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      setSelectedStoreSlug: (slug) => set({ selectedStoreSlug: slug }),
      
      reset: () => set(initialState),
    }),
    { name: 'products-store' }
  )
);