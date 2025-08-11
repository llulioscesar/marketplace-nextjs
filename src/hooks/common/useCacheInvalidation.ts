import { useQueryClient } from '@tanstack/react-query';

export const useCacheInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateStoreCache = (storeId?: string) => {
    // Invalidate all store-related queries
    queryClient.invalidateQueries({ queryKey: ['business', 'stores'] });
    queryClient.invalidateQueries({ queryKey: ['stores'] });
    
    if (storeId) {
      queryClient.invalidateQueries({ queryKey: ['business', 'store', storeId] });
      queryClient.removeQueries({ queryKey: ['business', 'store', storeId] }); // Force complete refresh
    }
  };

  const invalidateProductCache = (productId?: string) => {
    // Invalidate all product-related queries
    queryClient.invalidateQueries({ queryKey: ['business', 'products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    
    if (productId) {
      queryClient.invalidateQueries({ queryKey: ['business', 'product', productId] });
      queryClient.removeQueries({ queryKey: ['business', 'product', productId] }); // Force complete refresh
    }
  };

  const invalidateAllBusinessCache = () => {
    // Nuclear option - clear all business-related cache
    queryClient.invalidateQueries({ queryKey: ['business'] });
  };

  return {
    invalidateStoreCache,
    invalidateProductCache,
    invalidateAllBusinessCache,
  };
};