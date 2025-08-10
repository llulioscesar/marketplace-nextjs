import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  storeId: string;
  storeName: string;
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
}

type CartStore = CartState & CartActions;

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        total: 0,
        
        addItem: (newItem) => set((state) => {
          const existingItem = state.items.find((item) => item.productId === newItem.productId);
          
          let updatedItems: CartItem[];
          if (existingItem) {
            updatedItems = state.items.map((item) =>
              item.productId === newItem.productId
                ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
                : item
            );
          } else {
            updatedItems = [...state.items, { ...newItem, quantity: 1 }];
          }
          
          return {
            items: updatedItems,
            total: calculateTotal(updatedItems),
          };
        }),
        
        removeItem: (productId) => set((state) => {
          const updatedItems = state.items.filter((item) => item.productId !== productId);
          return {
            items: updatedItems,
            total: calculateTotal(updatedItems),
          };
        }),
        
        updateQuantity: (productId, quantity) => set((state) => {
          if (quantity <= 0) {
            const updatedItems = state.items.filter((item) => item.productId !== productId);
            return {
              items: updatedItems,
              total: calculateTotal(updatedItems),
            };
          }
          
          const updatedItems = state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(quantity, item.stock) }
              : item
          );
          
          return {
            items: updatedItems,
            total: calculateTotal(updatedItems),
          };
        }),
        
        clearCart: () => set({ items: [], total: 0 }),
        
        getItemQuantity: (productId) => {
          const item = get().items.find((item) => item.productId === productId);
          return item?.quantity || 0;
        },
        
        getTotalItems: () => {
          return get().items.reduce((sum, item) => sum + item.quantity, 0);
        },
      }),
      {
        name: 'cart-store',
      }
    ),
    { name: 'cart-store' }
  )
);