import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/stores';

export const useCartSession = () => {
  const { data: session, status } = useSession();
  const { setUserId, clearCart } = useCartStore();

  useEffect(() => {
    // Only update when session status is determined (not loading)
    if (status === 'loading') return;
    
    // Get current userId from session
    const currentUserId = session?.user?.id || null;
    
    // Update userId in store (this will clear cart if user changed)
    setUserId(currentUserId);
    
    // Additional safety: if no session and we had items, clear them
    if (!session && status === 'unauthenticated') {
      clearCart();
    }
  }, [session?.user?.id, status, setUserId, clearCart, session]);

  return { session, status };
};