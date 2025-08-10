import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStoresStore } from '@/store';

interface PaginatedStoresResponse {
  stores: Array<{
    id: string;
    name: string;
    description: string | null;
    slug: string;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    businessId: string;
    business: {
      id: string;
      name: string;
      email: string;
    };
    _count: {
      products: number;
    };
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalStores: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const fetchStores = async (page: number = 1, limit: number = 10): Promise<PaginatedStoresResponse> => {
  const response = await fetch(`/api/public/stores?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Error al cargar las tiendas');
  }
  return response.json();
};

export const useStores = (page: number = 1, limit: number = 10) => {
  const { setStores, setPagination, setLoading, setError } = useStoresStore();

  return useQuery({
    queryKey: ['stores', page, limit],
    queryFn: () => fetchStores(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStore = (slug: string) => {
  return useQuery({
    queryKey: ['store', slug],
    queryFn: async () => {
      const response = await fetch(`/api/public/stores/${slug}/products`);
      if (!response.ok) {
        throw new Error('Tienda no encontrada');
      }
      return response.json();
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateStore = () => {
  const queryClient = useQueryClient();
  const { addStore } = useStoresStore();

  return useMutation({
    mutationFn: async (storeData: any) => {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeData),
      });
      if (!response.ok) {
        throw new Error('Error al crear la tienda');
      }
      return response.json();
    },
    onSuccess: (newStore) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      addStore(newStore);
    },
  });
};

export const useUpdateStore = () => {
  const queryClient = useQueryClient();
  const { updateStore } = useStoresStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar la tienda');
      }
      return response.json();
    },
    onSuccess: (updatedStore) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store', updatedStore.slug] });
      updateStore(updatedStore.id, updatedStore);
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  const { removeStore } = useStoresStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar la tienda');
      }
      return { id };
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      removeStore(id);
    },
  });
};