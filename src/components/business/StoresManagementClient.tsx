'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, Plus } from 'lucide-react';
import { Pagination } from '@/components/common';
import StoreFilters from './StoreFilters';
import StoresGrid from './StoresGrid';
import StoreTable from './StoreTable';
import Link from 'next/link';
import { useBusinessStore } from '@/stores/businessStore';
import { 
  useBusinessStoresManagement, 
  useToggleStoreStatus, 
  useDeleteStore 
} from '@/hooks/business/useBusinessStoresManagement';
import { useDebounce } from '@/hooks/common/useDebounce';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

interface StoresManagementProps {
  user: User;
}

export default function StoresManagementClient({}: StoresManagementProps) {
  // Zustand state
  const {
    storesViewMode,
    storesItemsPerPage,
    storesFilters,
    setStoresViewMode,
    setStoresItemsPerPage,
    setStoresFilters,
  } = useBusinessStore();

  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query para evitar muchas peticiones
  const debouncedSearchQuery = useDebounce(storesFilters.searchQuery, 300);

  // Prepare filters for API
  const apiFilters = useMemo(() => ({
    searchQuery: debouncedSearchQuery,
    isActive: storesFilters.showActiveOnly,
    limit: storesItemsPerPage,
    offset: (currentPage - 1) * storesItemsPerPage,
  }), [
    debouncedSearchQuery,
    storesFilters.showActiveOnly,
    storesItemsPerPage,
    currentPage
  ]);

  // React Query hooks
  const { data, isLoading, error } = useBusinessStoresManagement(apiFilters);
  const toggleStoreStatusMutation = useToggleStoreStatus();
  const deleteStoreMutation = useDeleteStore();

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: Partial<typeof storesFilters>) => {
    setStoresFilters(newFilters);
    setCurrentPage(1);
  };

  const handleToggleStoreStatus = (storeId: string, currentStatus: boolean) => {
    toggleStoreStatusMutation.mutate({ storeId, isActive: !currentStatus });
  };

  const handleDeleteStore = (storeId: string, storeName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la tienda "${storeName}"?`)) {
      return;
    }
    
    deleteStoreMutation.mutate(storeId);
  };

  // Calculate pagination info
  const pagination = useMemo(() => {
    const totalStores = data?.totalCount || 0;
    const totalPages = Math.ceil(totalStores / storesItemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalStores,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }, [data?.totalCount, storesItemsPerPage, currentPage]);

  // Loading state
  if (isLoading && !data) {
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

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestión de Tiendas</h1>
          <p className="text-gray-600">Administra todas tus tiendas</p>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-red-500 mb-4">
              Error al cargar las tiendas
            </div>
            <p className="text-gray-600 mb-4">
              {error.message || 'Ocurrió un error inesperado'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stores = data?.stores || [];

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
        searchQuery={storesFilters.searchQuery}
        setSearchQuery={(query) => handleFilterChange({ searchQuery: query })}
        showActiveOnly={storesFilters.showActiveOnly}
        setShowActiveOnly={(active) => handleFilterChange({ showActiveOnly: active })}
        itemsPerPage={storesItemsPerPage}
        setItemsPerPage={setStoresItemsPerPage}
        viewMode={storesViewMode}
        setViewMode={setStoresViewMode}
        totalStores={pagination.totalStores}
      />

      {/* Lista de tiendas */}
      {stores.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {storesFilters.searchQuery ? 'No se encontraron tiendas' : 'No tienes tiendas'}
            </h3>
            <p className="text-gray-600 mb-4">
              {storesFilters.searchQuery 
                ? 'Ajusta los filtros para ver más tiendas'
                : 'Crea tu primera tienda para empezar a vender'
              }
            </p>
            {!storesFilters.searchQuery && (
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
            {storesViewMode === 'grid' ? (
              <StoresGrid
                stores={stores}
                onToggleStatus={handleToggleStoreStatus}
                onDelete={handleDeleteStore}
              />
            ) : (
              <StoreTable
                stores={stores}
                onToggleStatus={handleToggleStoreStatus}
                onDelete={handleDeleteStore}
              />
            )}
          </div>

          {/* Loading indicators */}
          {(toggleStoreStatusMutation.isPending || deleteStoreMutation.isPending) && (
            <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
              {deleteStoreMutation.isPending ? 'Eliminando tienda...' : 'Actualizando estado...'}
            </div>
          )}

          {/* Loading indicator durante refetch */}
          {isLoading && data && (
            <div className="fixed bottom-4 right-4 bg-gray-500 text-white px-4 py-2 rounded-md shadow-lg">
              Actualizando...
            </div>
          )}

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
                itemsPerPage={storesItemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}