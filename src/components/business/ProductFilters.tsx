'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter, ToggleLeft, ToggleRight, Grid3X3, List } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  stores: Store[];
  selectedStore: string;
  setSelectedStore: (storeId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showActiveOnly: boolean;
  setShowActiveOnly: (active: boolean) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  totalProducts: number;
}

export default function ProductFilters({
  stores,
  selectedStore,
  setSelectedStore,
  searchQuery,
  setSearchQuery,
  showActiveOnly,
  setShowActiveOnly,
  itemsPerPage,
  setItemsPerPage,
  viewMode,
  setViewMode,
  totalProducts
}: ProductFiltersProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
          <div>
            <Label htmlFor="store-select">Filtrar por tienda</Label>
            <select
              id="store-select"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="">Todas las tiendas</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="search">Buscar producto</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="items-per-page">Productos por página</Label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="12">12 productos</option>
              <option value="24">24 productos</option>
              <option value="48">48 productos</option>
              <option value="96">96 productos</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <button
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className="flex items-center gap-2"
            >
              {showActiveOnly ? (
                <ToggleRight className="h-5 w-5 text-blue-600" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm">Solo activos</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <Label className="text-sm">Vista:</Label>
            <div className="flex border rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center mt-6">
            <span className="text-sm text-gray-600">
              {totalProducts} productos en total
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}