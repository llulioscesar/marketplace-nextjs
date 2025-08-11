'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, FileText } from 'lucide-react';
import { Pagination } from '@/components/common';
import OrderFilters from './OrderFilters';
import OrdersGrid from './OrdersGrid';
import OrdersTable from './OrdersTable';
import { useBusinessStore } from '@/stores/businessStore';
import { useOrders, useUpdateOrderStatus } from '@/hooks/business/useOrders';
import { useBusinessStores } from '@/hooks/business/useBusinessStores';
import { useDebounce } from '@/hooks/common/useDebounce';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

interface OrdersManagementProps {
  user: User;
}

export default function OrdersManagementClient({}: OrdersManagementProps) {
  // Zustand state
  const {
    ordersViewMode,
    ordersItemsPerPage,
    ordersFilters,
    setOrdersViewMode,
    setOrdersItemsPerPage,
    setOrdersFilters,
  } = useBusinessStore();

  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query para evitar muchas peticiones
  const debouncedSearchQuery = useDebounce(ordersFilters.searchQuery, 300);

  // Prepare filters for API
  const apiFilters = useMemo(() => ({
    searchQuery: debouncedSearchQuery,
    statusFilter: ordersFilters.statusFilter,
    storeFilter: ordersFilters.storeFilter,
    startDate: ordersFilters.dateRange.startDate,
    endDate: ordersFilters.dateRange.endDate,
    limit: ordersItemsPerPage,
    offset: (currentPage - 1) * ordersItemsPerPage,
  }), [
    debouncedSearchQuery,
    ordersFilters.statusFilter,
    ordersFilters.storeFilter,
    ordersFilters.dateRange.startDate,
    ordersFilters.dateRange.endDate,
    ordersItemsPerPage,
    currentPage
  ]);

  // React Query hooks
  const { data, isLoading, error } = useOrders(apiFilters);
  const { data: stores = [] } = useBusinessStores();
  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: Partial<typeof ordersFilters>) => {
    setOrdersFilters(newFilters);
    setCurrentPage(1);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  // Calculate pagination info
  const pagination = useMemo(() => {
    const totalOrders = data?.totalCount || 0;
    const totalPages = Math.ceil(totalOrders / ordersItemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalOrders,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }, [data?.totalCount, ordersItemsPerPage, currentPage]);

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestión de Órdenes</h1>
          <p className="text-gray-600">Administra todas las órdenes de tus tiendas</p>
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
          <h1 className="text-3xl font-bold mb-2">Gestión de Órdenes</h1>
          <p className="text-gray-600">Administra todas las órdenes de tus tiendas</p>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-red-500 mb-4">
              Error al cargar las órdenes
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

  const orders = data?.orders || [];

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Órdenes</h1>
            <p className="text-gray-600">Administra todas las órdenes de tus tiendas</p>
          </div>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <OrderFilters
        searchQuery={ordersFilters.searchQuery}
        setSearchQuery={(query) => handleFilterChange({ searchQuery: query })}
        statusFilter={ordersFilters.statusFilter}
        setStatusFilter={(status) => handleFilterChange({ statusFilter: status })}
        storeFilter={ordersFilters.storeFilter}
        setStoreFilter={(store) => handleFilterChange({ storeFilter: store })}
        dateRange={ordersFilters.dateRange}
        setDateRange={(range) => handleFilterChange({ dateRange: range })}
        itemsPerPage={ordersItemsPerPage}
        setItemsPerPage={setOrdersItemsPerPage}
        viewMode={ordersViewMode}
        setViewMode={setOrdersViewMode}
        totalOrders={pagination.totalOrders}
        stores={stores}
      />

      {/* Lista de órdenes */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {ordersFilters.searchQuery || ordersFilters.statusFilter || ordersFilters.storeFilter || 
               ordersFilters.dateRange.startDate || ordersFilters.dateRange.endDate
                ? 'No se encontraron órdenes' 
                : 'No hay órdenes'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {ordersFilters.searchQuery || ordersFilters.statusFilter || ordersFilters.storeFilter || 
               ordersFilters.dateRange.startDate || ordersFilters.dateRange.endDate
                ? 'Ajusta los filtros para ver más órdenes'
                : 'Las órdenes aparecerán aquí cuando los clientes hagan compras'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {ordersViewMode === 'grid' ? (
              <OrdersGrid
                orders={orders}
                onUpdateStatus={handleUpdateOrderStatus}
              />
            ) : (
              <OrdersTable
                orders={orders}
                onUpdateStatus={handleUpdateOrderStatus}
              />
            )}
          </div>

          {/* Loading indicator durante mutations */}
          {updateOrderStatusMutation.isPending && (
            <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
              Actualizando orden...
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
                totalItems={pagination.totalOrders}
                itemsPerPage={ordersItemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}