'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface StoreCardProps {
  store: StoreData;
  onToggleStatus: (storeId: string, currentStatus: boolean) => void;
  onDelete: (storeId: string, storeName: string) => void;
}

export default function StoreCard({ store, onToggleStatus, onDelete }: StoreCardProps) {
  return (
    <Card>
      {store.imageUrl && (
        <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          <img
            src={store.imageUrl}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1">{store.name}</CardTitle>
          <Badge variant={store.isActive ? "default" : "secondary"}>
            {store.isActive ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {store.description || 'Sin descripción'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              {store._count.products} productos
            </span>
            <span>{store._count.orders} órdenes</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/stores/${store.slug}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
          </Link>
          <Link href={`/dashboard/stores/${store.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Edit className="h-4 w-4 mr-1" />
              Editar
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
      </CardContent>
    </Card>
  );
}