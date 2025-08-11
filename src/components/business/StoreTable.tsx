'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Package } from 'lucide-react';
import Link from 'next/link';

interface StoreData {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    products: number;
    orders: number;
  };
}

interface StoreTableProps {
  stores: StoreData[];
  onToggleStatus: (storeId: string, currentStatus: boolean) => void;
  onDelete: (storeId: string, storeName: string) => void;
}

export default function StoreTable({ stores, onToggleStatus, onDelete }: StoreTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">Tienda</th>
                <th className="text-left p-4 font-medium">Productos</th>
                <th className="text-left p-4 font-medium">Órdenes</th>
                <th className="text-left p-4 font-medium">Estado</th>
                <th className="text-center p-4 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {store.imageUrl && (
                        <img
                          src={store.imageUrl}
                          alt={store.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium line-clamp-1">{store.name}</div>
                        <div className="text-sm text-gray-600 line-clamp-1">
                          {store.description || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{store._count.products}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">{store._count.orders}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant={store.isActive ? "default" : "secondary"}>
                      {store.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/stores/${store.slug}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/stores/${store.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => onToggleStatus(store.id, store.isActive)}
                      >
                        {store.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="outline" 
                        size="sm"
                        onClick={() => onDelete(store.id, store.name)}
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