'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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

interface ProductTableProps {
  products: ProductWithStore[];
  onToggleStatus: (productId: string, currentStatus: boolean) => void;
  onDelete: (productId: string, productName: string) => void;
}

export default function ProductTable({ products, onToggleStatus, onDelete }: ProductTableProps) {
  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock <= 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Producto</th>
                <th className="text-left p-4 font-medium">Tienda</th>
                <th className="text-left p-4 font-medium">Precio</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Estado</th>
                <th className="text-center p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium line-clamp-1">{product.name}</div>
                        <div className="text-sm text-gray-600 line-clamp-1">
                          {product.description || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{product.store.name}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold">${Number(product.price).toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getStockStatusColor(product.stock)}`}>
                      {product.stock} unidades
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/stores/${product.store.slug}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}