import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/store';
import { toast } from 'sonner';

export const useCart = () => {
  const {
    items,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    getTotalItems,
  } = useCartStore();

  return {
    items,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    getTotalItems,
    itemCount: getTotalItems(),
  };
};

export const useAddToCart = () => {
  const { addItem, getItemQuantity } = useCartStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: any) => {
      // Simulate API call delay - no validation here since onMutate handles it
      await new Promise(resolve => setTimeout(resolve, 100));
      return product;
    },
    onMutate: async (product) => {
      // Check stock before adding
      const currentQuantity = getItemQuantity(product.id);
      const availableStock = product.stock - currentQuantity;
      
      if (availableStock <= 0) {
        return;
      }

      // Optimistic update
      addItem({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.imageUrl,
        storeId: product.storeId,
        storeName: product.store?.name || 'Tienda',
        storeSlug: product.store?.slug,
        stock: product.stock,
      });
      
      toast.success(`${product.name} agregado al carrito`, {richColors: true});
    },
    onError: (error, product) => {
      // Revert optimistic updates on error
      const { removeItem } = useCartStore.getState();
      removeItem(product.id);
      
      // No need to revert product cache since we don't modify it
      
      toast.error(error.message || 'Error al agregar al carrito', {richColors:true});
    },
  });
};

export const useRemoveFromCart = () => {
  const { removeItem } = useCartStore();

  return useMutation({
    mutationFn: async (productId: string) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return productId;
    },
    onMutate: async (productId) => {
      removeItem(productId);
      toast.success('Producto eliminado del carrito', {richColors: true});
    },
    onError: () => {
      toast.error('Error al eliminar del carrito', {richColors: true});
    },
  });
};

export const useUpdateCartQuantity = () => {
  const { updateQuantity } = useCartStore();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { productId, quantity };
    },
    onMutate: async ({ productId, quantity }) => {
      updateQuantity(productId, quantity);
    },
    onError: () => {
      toast.error('Error al actualizar cantidad', {richColors: true});
    },
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: async (orderData: object) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('Error al procesar la orden');
      }
      return response.json();
    },
    onSuccess: (orderResponse, orderData: any) => {
      // Invalidate all relevant queries to update stock
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store'] });
      
      // Invalidate specific store queries if we have the store slug
      if (orderData.storeSlug) {
        queryClient.invalidateQueries({ 
          queryKey: ['products', orderData.storeSlug] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['store', orderData.storeSlug] 
        });
      }
      
      toast.success('Orden creada exitosamente', {richColors: true});
    },
    onSettled: () => {
      // Clear cart after all operations (success or error)
      clearCart();
    },
    onError: () => {
      toast.error('Error al procesar la orden', {richColors: true});
    },
  });
};