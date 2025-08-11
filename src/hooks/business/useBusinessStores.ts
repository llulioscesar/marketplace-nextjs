import { useQuery } from '@tanstack/react-query';

export interface BusinessStore {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    products: number;
    orders: number;
  };
}

export interface BusinessStoresResponse {
  stores: BusinessStore[];
  totalCount?: number;
}

const fetchBusinessStores = async (): Promise<BusinessStoresResponse> => {
  const response = await fetch('/api/business/stores');
  if (!response.ok) {
    throw new Error('Error al cargar las tiendas');
  }
  
  return response.json();
};

// Hook simple para obtener todas las tiendas (para filtros)
export const useBusinessStores = () => {
  return useQuery({
    queryKey: ['business', 'stores', 'all'],
    queryFn: fetchBusinessStores,
    staleTime: 10 * 60 * 1000, // 10 minutes - las tiendas cambian menos
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    select: (data) => data.stores || [],
  });
};