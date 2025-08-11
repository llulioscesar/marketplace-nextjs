import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useProductsStore } from '@/stores';

const fetchProducts = async (storeSlug: string) => {
  const response = await fetch(`/api/public/stores/${storeSlug}/products`);
  if (!response.ok) {
    throw new Error('Error al cargar los productos');
  }
  return response.json();
};

export const useProducts = (storeSlug: string) => {
  const { setProducts, setLoading, setError, setSelectedStoreSlug } = useProductsStore();

  return useQuery({
    queryKey: ['products', storeSlug],
    queryFn: () => fetchProducts(storeSlug),
    enabled: !!storeSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Producto no encontrado');
      }
      return response.json();
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { addProduct, selectedStoreSlug } = useProductsStore();

  return useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error('Error al crear el producto');
      }
      return response.json();
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (selectedStoreSlug) {
        queryClient.invalidateQueries({ queryKey: ['products', selectedStoreSlug] });
      }
      addProduct(newProduct);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { updateProduct, selectedStoreSlug } = useProductsStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }
      return response.json();
    },
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] });
      if (selectedStoreSlug) {
        queryClient.invalidateQueries({ queryKey: ['products', selectedStoreSlug] });
      }
      updateProduct(updatedProduct.id, updatedProduct);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { removeProduct, selectedStoreSlug } = useProductsStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      return { id };
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (selectedStoreSlug) {
        queryClient.invalidateQueries({ queryKey: ['products', selectedStoreSlug] });
      }
      removeProduct(id);
    },
  });
};

export const useProductSearch = (query: string, filters?: any) => {
  return useQuery({
    queryKey: ['products', 'search', query, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        ...filters,
      });
      const response = await fetch(`/api/products/search?${params}`);
      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }
      return response.json();
    },
    enabled: query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};