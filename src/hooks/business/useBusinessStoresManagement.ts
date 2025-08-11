import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Tipos
export interface BusinessStoreData {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    products: number;
    orders: number;
  };
}

export interface StoresFilters {
  searchQuery?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface StoresResponse {
  stores: BusinessStoreData[];
  totalCount: number;
}

// API functions
const fetchBusinessStores = async (filters: StoresFilters): Promise<StoresResponse> => {
  const params = new URLSearchParams();
  
  if (filters.searchQuery) params.append('search', filters.searchQuery);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await fetch(`/api/business/stores?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar las tiendas');
  }
  
  return response.json();
};

const toggleStoreStatus = async ({ storeId, isActive }: { storeId: string; isActive: boolean }) => {
  const response = await fetch(`/api/business/stores/${storeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive })
  });
  
  if (!response.ok) {
    throw new Error('Error al cambiar el estado de la tienda');
  }
  
  return response.json();
};

const deleteStore = async (storeId: string) => {
  const response = await fetch(`/api/business/stores/${storeId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar la tienda');
  }
  
  return response.json();
};

// Hooks
export const useBusinessStoresManagement = (filters: StoresFilters) => {
  return useQuery({
    queryKey: ['business', 'stores', 'management', filters],
    queryFn: () => fetchBusinessStores(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - las tiendas cambian menos frecuentemente
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    enabled: true,
  });
};

export const useToggleStoreStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleStoreStatus,
    onMutate: async ({ storeId, isActive }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['business', 'stores', 'management'] });
      
      const previousData = queryClient.getQueriesData({ 
        queryKey: ['business', 'stores', 'management'] 
      });
      
      // Update all relevant queries
      queryClient.setQueriesData<StoresResponse>(
        { queryKey: ['business', 'stores', 'management'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            stores: old.stores.map(store =>
              store.id === storeId ? { ...store, isActive } : store
            )
          };
        }
      );
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error('Error al cambiar el estado de la tienda');
    },
    onSuccess: (data, { isActive }) => {
      toast.success(`Tienda ${isActive ? 'activada' : 'desactivada'} exitosamente`);
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['business', 'stores', 'management'],
        refetchType: 'none' // Don't refetch immediately since we have optimistic update
      });
      
      // Also invalidate the simple stores query used for dropdowns
      queryClient.invalidateQueries({ 
        queryKey: ['business', 'stores', 'all'],
        refetchType: 'none'
      });
    },
    onSettled: () => {
      // Always refetch after 2 seconds to ensure consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['business', 'stores'] });
      }, 2000);
    },
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (storeData: any) => {
      const response = await fetch('/api/business/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la tienda');
      }
      return response.json();
    },
    onSuccess: (newStore) => {
      toast.success('Tienda creada exitosamente');
      
      // Invalidate all store-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['business', 'stores'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] }); // For public stores
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear la tienda');
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/business/stores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la tienda');
      }
      return response.json();
    },
    onSuccess: (updatedStore) => {
      toast.success('Tienda actualizada exitosamente');
      
      // Invalidate all store-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['business', 'stores'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] }); // For public stores
      queryClient.invalidateQueries({ queryKey: ['store', updatedStore.slug] }); // Specific store
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar la tienda');
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteStore,
    onSuccess: (data, storeId) => {
      // Remove store from all management queries
      queryClient.setQueriesData<StoresResponse>(
        { queryKey: ['business', 'stores', 'management'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            stores: old.stores.filter(store => store.id !== storeId),
            totalCount: old.totalCount - 1
          };
        }
      );
      
      toast.success('Tienda eliminada exitosamente');
      
      // Invalidate all store-related queries
      queryClient.invalidateQueries({ queryKey: ['business', 'stores'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] }); // For public stores
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar la tienda');
    },
  });
};