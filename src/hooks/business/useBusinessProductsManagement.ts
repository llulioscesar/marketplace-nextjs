import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Tipos
export interface BusinessProductData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  store: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProductsFilters {
  searchQuery?: string;
  storeFilter?: string;
  isActive?: boolean;
  hasStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface ProductsResponse {
  products: BusinessProductData[];
  totalCount: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
}

// API functions
const fetchBusinessProducts = async (filters: ProductsFilters): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.searchQuery) params.append('search', filters.searchQuery);
  if (filters.storeFilter) params.append('storeId', filters.storeFilter);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters.hasStock !== undefined) params.append('hasStock', filters.hasStock.toString());
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await fetch(`/api/business/products?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar los productos');
  }
  
  return response.json();
};

const updateProduct = async ({ productId, data }: { productId: string; data: UpdateProductData }) => {
  const response = await fetch(`/api/business/products/${productId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Error al actualizar el producto');
  }
  
  return response.json();
};

const createProduct = async (productData: any) => {
  const response = await fetch('/api/business/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear el producto');
  }
  return response.json();
};

const deleteProduct = async (productId: string) => {
  const response = await fetch(`/api/business/products/${productId}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar el producto');
  }
  
  return response.json();
};

const toggleProductStatus = async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
  return updateProduct({ productId, data: { isActive } });
};

const updateProductStock = async ({ productId, stock }: { productId: string; stock: number }) => {
  return updateProduct({ productId, data: { stock } });
};

// Hooks
export const useBusinessProductsManagement = (filters: ProductsFilters) => {
  return useQuery({
    queryKey: ['business', 'products', 'management', filters],
    queryFn: () => fetchBusinessProducts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - productos cambian más frecuentemente
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: true,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (newProduct) => {
      toast.success('Producto creado exitosamente');
      
      // Invalidate all product-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['business', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // For public products
      queryClient.invalidateQueries({ queryKey: ['business', 'stores'] }); // Store product count might change
    },
    onError: (error) => {
      toast.error(error.message || 'Error al crear el producto');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProduct,
    onMutate: async ({ productId, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['business', 'products', 'management'] });
      
      const previousData = queryClient.getQueriesData({ 
        queryKey: ['business', 'products', 'management'] 
      });
      
      // Update all relevant queries
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ['business', 'products', 'management'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            products: old.products.map(product =>
              product.id === productId ? { ...product, ...data } : product
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
      
      toast.error('Error al actualizar el producto');
    },
    onSuccess: (updatedProduct) => {
      toast.success('Producto actualizado exitosamente');
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['business', 'products', 'management'],
        refetchType: 'none'
      });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // For public products
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct.id] }); // Specific product
    },
    onSettled: () => {
      // Always refetch after 2 seconds to ensure consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['business', 'products'] });
      }, 2000);
    },
  });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleProductStatus,
    onMutate: async ({ productId, isActive }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['business', 'products', 'management'] });
      
      const previousData = queryClient.getQueriesData({ 
        queryKey: ['business', 'products', 'management'] 
      });
      
      // Update all relevant queries
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ['business', 'products', 'management'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            products: old.products.map(product =>
              product.id === productId ? { ...product, isActive } : product
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
      
      toast.error('Error al cambiar el estado del producto');
    },
    onSuccess: (data, { isActive }) => {
      toast.success(`Producto ${isActive ? 'activado' : 'desactivado'} exitosamente`);
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['business', 'products', 'management'],
        refetchType: 'none'
      });
    },
    onSettled: () => {
      // Always refetch after 2 seconds to ensure consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['business', 'products'] });
      }, 2000);
    },
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProductStock,
    onMutate: async ({ productId, stock }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['business', 'products', 'management'] });
      
      const previousData = queryClient.getQueriesData({ 
        queryKey: ['business', 'products', 'management'] 
      });
      
      // Update all relevant queries
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ['business', 'products', 'management'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            products: old.products.map(product =>
              product.id === productId ? { ...product, stock } : product
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
      
      toast.error('Error al actualizar el stock');
    },
    onSuccess: () => {
      toast.success('Stock actualizado exitosamente');
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['business', 'products', 'management'],
        refetchType: 'none'
      });
    },
    onSettled: () => {
      // Always refetch after 2 seconds to ensure consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['business', 'products'] });
      }, 2000);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (data, productId) => {
      // Remove product from all management queries
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ['business', 'products', 'management'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            products: old.products.filter(product => product.id !== productId),
            totalCount: old.totalCount - 1
          };
        }
      );
      
      toast.success('Producto eliminado exitosamente');
      
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ queryKey: ['business', 'products'] });
      
      // Also invalidate store queries since product count might change
      queryClient.invalidateQueries({ queryKey: ['business', 'stores'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Error al eliminar el producto');
    },
  });
};