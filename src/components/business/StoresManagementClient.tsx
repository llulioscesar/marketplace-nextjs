'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Package, Edit, Trash2, Plus, Eye } from 'lucide-react';
import Link from 'next/link';
import { formatPriceCOP } from '@/lib/utils/currency.utils';
import { toast } from 'sonner';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

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

interface StoresManagementProps {
  user: User;
}

export default function StoresManagementClient({ user }: StoresManagementProps) {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/business/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Error al cargar las tiendas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStore = async (storeId: string, storeName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la tienda "${storeName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/business/stores/${storeId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setStores(stores.filter(store => store.id !== storeId));
        toast.success('Tienda eliminada exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al eliminar la tienda');
      }
    } catch (error) {
      toast.error('Error al eliminar la tienda');
    }
  };

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/business/stores/${storeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setStores(stores.map(store => 
          store.id === storeId 
            ? { ...store, isActive: !currentStatus }
            : store
        ));
        toast.success(`Tienda ${!currentStatus ? 'activada' : 'desactivada'} exitosamente`);
      } else {
        toast.error('Error al cambiar el estado de la tienda');
      }
    } catch (error) {
      toast.error('Error al cambiar el estado de la tienda');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestión de Tiendas</h1>
          <p className="text-gray-600">Administra todas tus tiendas</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Tiendas</h1>
            <p className="text-gray-600">Administra todas tus tiendas</p>
          </div>
          <Link href="/dashboard/stores/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tienda
            </Button>
          </Link>
        </div>
      </div>

      {stores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes tiendas</h3>
            <p className="text-gray-600 mb-4">Crea tu primera tienda para empezar a vender</p>
            <Link href="/dashboard/stores/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Tienda
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Card key={store.id}>
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
                    onClick={() => toggleStoreStatus(store.id, store.isActive)}
                  >
                    {store.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteStore(store.id, store.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}