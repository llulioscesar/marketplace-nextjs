'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks';

interface CartButtonProps {
  onClick?: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const { itemCount } = useCart();

  if (onClick) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className="relative"
        onClick={onClick}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Carrito
        {itemCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Link href="/checkout">
      <Button 
        variant="outline" 
        size="sm"
        className="relative"
        disabled={itemCount === 0}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Carrito
        {itemCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>
    </Link>
  );
}