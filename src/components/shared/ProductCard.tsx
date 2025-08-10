'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@prisma/client';
import { ShoppingCart } from 'lucide-react';
import { formatPriceCOP } from '@/lib/utils/currency.utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {

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
          <Badge variant={product.stock > 5 ? "default" : "destructive"}>
            {product.stock} disponibles
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
        </Button>
      </CardFooter>
    </Card>
  );
}