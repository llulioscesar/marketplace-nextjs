'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface Store {
  id: string;
  name: string;
  slug: string;
}

interface ProductWithStore {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  store: Store;
}

interface ProductCardProps {
  product: ProductWithStore;
  onToggleStatus: (productId: string, currentStatus: boolean) => void;
  onDelete: (productId: string, productName: string) => void;
}

export default function ProductCard({ product, onToggleStatus, onDelete }: ProductCardProps) {
  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return 'Sin stock';
    if (stock <= 5) return 'Stock bajo';
    return 'En stock';
  };

  return (
    <Card>
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
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1">{product.name}</CardTitle>
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {product.description || 'Sin descripción'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Precio:</span>
            <span className="font-semibold">${Number(product.price).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Stock:</span>
            <span className={`font-semibold ${getStockStatusColor(product.stock)}`}>
              {product.stock} unidades
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estado:</span>
            <span className={getStockStatusColor(product.stock)}>
              {getStockStatusText(product.stock)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tienda:</span>
            <span className="text-sm">{product.store.name}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/stores/${product.store.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
          </Link>
          <Link href={`/dashboard/products/${product.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </Link>
          <Button
            variant="outline" 
            size="sm"
            onClick={() => onToggleStatus(product.id, product.isActive)}
          >
            {product.isActive ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="outline" 
            size="sm"
            onClick={() => onDelete(product.id, product.name)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}