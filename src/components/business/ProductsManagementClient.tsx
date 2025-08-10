'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { Pagination } from '@/components/common';
import ProductFilters from './ProductFilters';
import ProductsGrid from './ProductsGrid';
import ProductTable from './ProductTable';
import Link from 'next/link';
import { toast } from 'sonner';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

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

interface ProductsManagementProps {
  user: User;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ProductsManagementClient({ user }: ProductsManagementProps) {
  const [products, setProducts] = useState<ProductWithStore[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNext: false,
    hasPrev: false
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (stores.length > 0) {
      setCurrentPage(1); // Reset to first page when filters change
      fetchProducts();
    }
  }, [selectedStore, searchQuery, showActiveOnly, stores, itemsPerPage]);

  useEffect(() => {
    if (stores.length > 0) {
      fetchProducts();
    }
  }, [currentPage]);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/business/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Error al cargar las tiendas');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStore) params.append('storeId', selectedStore);
      if (searchQuery) params.append('search', searchQuery);
      if (showActiveOnly) params.append('isActive', 'true');
      
      // Add pagination params
      params.append('limit', itemsPerPage.toString());
      params.append('offset', ((currentPage - 1) * itemsPerPage).toString());
      
      const response = await fetch(`/api/business/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        
        // Calculate pagination info
        const totalProducts = data.totalCount || data.products.length;
        const totalPages = Math.ceil(totalProducts / itemsPerPage);
        
        setPagination({
          currentPage,
          totalPages,
          totalProducts,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/business/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle' })
      });

      if (response.ok) {
        setProducts(products.map(product => 
          product.id === productId 
            ? { ...product, isActive: !currentStatus }
            : product
        ));
        toast.success(`Producto ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      } else {
        toast.error('Error al cambiar el estado del producto');
      }
    } catch (error) {
      toast.error('Error al cambiar el estado del producto');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${productName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/business/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProducts(products.filter(product => product.id !== productId));
        toast.success('Producto eliminado exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al eliminar el producto');
      }
    } catch (error) {
      toast.error('Error al eliminar el producto');
    }
  };

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

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestión de Productos</h1>
          <p className="text-gray-600">Administra todos tus productos por tienda</p>
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
            <h1 className="text-3xl font-bold mb-2">Gestión de Productos</h1>
            <p className="text-gray-600">Administra todos tus productos por tienda</p>
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
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showActiveOnly={showActiveOnly}
        setShowActiveOnly={setShowActiveOnly}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalProducts={pagination.totalProducts}
      />

      {/* Lista de productos */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {selectedStore || searchQuery ? 'No se encontraron productos' : 'No tienes productos'}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedStore || searchQuery 
                ? 'Ajusta los filtros para ver más productos'
                : 'Crea tu primer producto para empezar a vender'
              }
            </p>
            {!selectedStore && !searchQuery && (
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
            {viewMode === 'grid' ? (
              <ProductsGrid
                products={products}
                stores={stores}
                selectedStore={selectedStore}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteProduct}
              />
            ) : (
              <ProductTable
                products={products}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteProduct}
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
                totalItems={pagination.totalProducts}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

