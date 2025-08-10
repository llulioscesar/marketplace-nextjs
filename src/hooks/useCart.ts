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
  const { addItem } = useCartStore();

  return useMutation({
    mutationFn: async (product: any) => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return product;
    },
    onMutate: async (product) => {
      // Optimistic update
      addItem({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.imageUrl,
        storeId: product.storeId,
        storeName: product.store?.name || 'Tienda',
        stock: product.stock,
      });
      
      toast.success(`${product.name} agregado al carrito`);
    },
    onError: (error, product) => {
      // Revert optimistic update on error
      const { removeItem } = useCartStore.getState();
      removeItem(product.id);
      toast.error('Error al agregar al carrito');
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
      toast.success('Producto eliminado del carrito');
    },
    onError: (error, productId, context) => {
      toast.error('Error al eliminar del carrito');
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
    onError: (error, { productId, quantity }) => {
      toast.error('Error al actualizar cantidad');
    },
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: async (orderData: any) => {
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
    onSuccess: (order) => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Orden creada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al procesar la orden');
    },
  });
};