'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@prisma/client';
import { ShoppingCart } from 'lucide-react';
import { formatPriceCOP } from '@/lib/utils/currency.utils';
import { useCart } from '@/hooks';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { getItemQuantity } = useCart();
  const quantityInCart = getItemQuantity(product.id);
  const availableStock = Math.max(0, product.stock - quantityInCart);
  
  const handleAddToCart = () => {
    if (availableStock > 0) {
      onAddToCart(product);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      {product.imageUrl && (
        <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description || 'Sin descripción'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center">
          <p className="text-2xl font-bold">
            {formatPriceCOP(Number(product.price))}
          </p>
          <div className="flex flex-col gap-1">
            <Badge variant={availableStock > 5 ? "default" : availableStock > 0 ? "secondary" : "destructive"}>
              {availableStock} disponibles
            </Badge>
            {quantityInCart > 0 && (
              <Badge variant="outline" className="text-xs">
                {quantityInCart} en carrito
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={availableStock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {availableStock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
      </CardFooter>
    </Card>
  );
}