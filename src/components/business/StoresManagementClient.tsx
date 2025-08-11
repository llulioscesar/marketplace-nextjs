'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Plus } from 'lucide-react';
import { Pagination } from '@/components/common';
import StoreFilters from './StoreFilters';
import StoresGrid from './StoresGrid';
import StoreTable from './StoreTable';
import Link from 'next/link';
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalStores: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function StoresManagementClient({ user }: StoresManagementProps) {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalStores: 0,
    hasNext: false,
    hasPrev: false
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
      if (showActiveOnly) params.append('isActive', 'true');
      
      // Add pagination params
      params.append('limit', itemsPerPage.toString());
      params.append('offset', ((currentPage - 1) * itemsPerPage).toString());
      
      const response = await fetch(`/api/business/stores?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores);
        
        // Calculate pagination info
        const totalStores = data.totalCount || data.stores.length;
        const totalPages = Math.ceil(totalStores / itemsPerPage);
        
        setPagination({
          currentPage,
          totalPages,
          totalStores,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1
        });
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Error al cargar las tiendas');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, showActiveOnly, itemsPerPage, currentPage]);

  // Effect for filter changes - reset to page 1 and fetch
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, showActiveOnly, itemsPerPage]);

  // Effect for data fetching - runs when dependencies change
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

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
          {[...Array(6)].map((_, i) => (
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

      <StoreFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showActiveOnly={showActiveOnly}
        setShowActiveOnly={setShowActiveOnly}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalStores={pagination.totalStores}
      />

      {/* Lista de tiendas */}
      {stores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No se encontraron tiendas' : 'No tienes tiendas'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? 'Ajusta los filtros para ver más tiendas'
                : 'Crea tu primera tienda para empezar a vender'
              }
            </p>
            {!searchQuery && (
              <Link href="/dashboard/stores/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Tienda
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {viewMode === 'grid' ? (
              <StoresGrid
                stores={stores}
                onToggleStatus={toggleStoreStatus}
                onDelete={handleDeleteStore}
              />
            ) : (
              <StoreTable
                stores={stores}
                onToggleStatus={toggleStoreStatus}
                onDelete={handleDeleteStore}
              />
            )}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
                hasNextPage={pagination.hasNext}
                hasPreviousPage={pagination.hasPrev}
                totalItems={pagination.totalStores}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}