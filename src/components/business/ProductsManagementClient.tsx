'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { Pagination } from '@/components/common';
import ProductFilters from './ProductFilters';
import ProductsGrid from './ProductsGrid';
import ProductTable from './ProductTable';
import Link from 'next/link';
import { useBusinessStore } from '@/stores/businessStore';
import { 
  useBusinessProductsManagement,
  useToggleProductStatus,
  useDeleteProduct
} from '@/hooks/business/useBusinessProductsManagement';
import { useBusinessStores } from '@/hooks/business/useBusinessStores';
import { useDebounce } from '@/hooks/common/useDebounce';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

interface ProductsManagementProps {
  user: User;
}

export default function ProductsManagementClient({}: ProductsManagementProps) {
  // Zustand state
  const {
    productsViewMode,
    productsItemsPerPage,
    productsFilters,
    setProductsViewMode,
    setProductsItemsPerPage,
    setProductsFilters,
  } = useBusinessStore();

  // Local state for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query para evitar muchas peticiones
  const debouncedSearchQuery = useDebounce(productsFilters.searchQuery, 300);

  // Prepare filters for API
  const apiFilters = useMemo(() => ({
    searchQuery: debouncedSearchQuery,
    storeFilter: productsFilters.storeFilter,
    isActive: productsFilters.showActiveOnly,
    limit: productsItemsPerPage,
    offset: (currentPage - 1) * productsItemsPerPage,
  }), [
    debouncedSearchQuery,
    productsFilters.storeFilter,
    productsFilters.showActiveOnly,
    productsItemsPerPage,
    currentPage
  ]);

  // React Query hooks
  const { data, isLoading, error } = useBusinessProductsManagement(apiFilters);
  const { data: stores = [] } = useBusinessStores();
  const toggleProductStatusMutation = useToggleProductStatus();
  const deleteProductMutation = useDeleteProduct();

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: Partial<typeof productsFilters>) => {
    setProductsFilters(newFilters);
    setCurrentPage(1);
  };

  const handleToggleProductStatus = (productId: string, currentStatus: boolean) => {
    toggleProductStatusMutation.mutate({ productId, isActive: !currentStatus });
  };


  const handleDeleteProduct = (productId: string, productName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${productName}"?`)) {
      return;
    }
    
    deleteProductMutation.mutate(productId);
  };

  // Calculate pagination info
  const pagination = useMemo(() => {
    const totalProducts = data?.totalCount || 0;
    const totalPages = Math.ceil(totalProducts / productsItemsPerPage);
    
    return {
      currentPage,
      totalPages,
      totalProducts,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }, [data?.totalCount, productsItemsPerPage, currentPage]);

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestión de Productos</h1>
          <p className="text-gray-600">Administra todos los productos de tus tiendas</p>
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
          <h1 className="text-3xl font-bold mb-2">Gestión de Productos</h1>
          <p className="text-gray-600">Administra todos los productos de tus tiendas</p>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-red-500 mb-4">
              Error al cargar los productos
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

  const products = data?.products || [];

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Productos</h1>
            <p className="text-gray-600">Administra todos los productos de tus tiendas</p>
          </div>
          <Link href="/dashboard/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </Link>
        </div>
      </div>

      <ProductFilters
        stores={stores}
        selectedStore={productsFilters.storeFilter}
        setSelectedStore={(store) => handleFilterChange({ storeFilter: store })}
        searchQuery={productsFilters.searchQuery}
        setSearchQuery={(query) => handleFilterChange({ searchQuery: query })}
        showActiveOnly={productsFilters.showActiveOnly}
        setShowActiveOnly={(active) => handleFilterChange({ showActiveOnly: active })}
        itemsPerPage={productsItemsPerPage}
        setItemsPerPage={setProductsItemsPerPage}
        viewMode={productsViewMode}
        setViewMode={setProductsViewMode}
        totalProducts={pagination.totalProducts}
      />

      {/* Lista de productos */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {productsFilters.searchQuery || productsFilters.storeFilter || productsFilters.categoryFilter
                ? 'No se encontraron productos' 
                : 'No tienes productos'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {productsFilters.searchQuery || productsFilters.storeFilter || productsFilters.categoryFilter
                ? 'Ajusta los filtros para ver más productos'
                : 'Crea tu primer producto para empezar a vender'
              }
            </p>
            {!productsFilters.searchQuery && !productsFilters.storeFilter && !productsFilters.categoryFilter && (
              <Link href="/dashboard/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Producto
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-6">
            {productsViewMode === 'grid' ? (
              <ProductsGrid
                products={products}
                stores={stores}
                selectedStore={productsFilters.storeFilter}
                onToggleStatus={handleToggleProductStatus}
                onDelete={handleDeleteProduct}
              />
            ) : (
              <ProductTable
                products={products}
                onToggleStatus={handleToggleProductStatus}
                onDelete={handleDeleteProduct}
              />
            )}
          </div>

          {/* Loading indicators */}
          {(toggleProductStatusMutation.isPending || 
            deleteProductMutation.isPending) && (
            <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg">
              {deleteProductMutation.isPending && 'Eliminando producto...'}
              {toggleProductStatusMutation.isPending && 'Cambiando estado...'}
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
                totalItems={pagination.totalProducts}
                itemsPerPage={productsItemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}