'use client';

import { useCartSession } from '@/hooks';

interface CartSessionProviderProps {
  children: React.ReactNode;
}

export function CartSessionProvider({ children }: CartSessionProviderProps) {
  // This hook automatically manages cart session
  useCartSession();
  
  return <>{children}</>;
}