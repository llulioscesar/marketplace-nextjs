'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter, ToggleLeft, ToggleRight, Grid3X3, List } from 'lucide-react';

interface StoreFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showActiveOnly: boolean;
  setShowActiveOnly: (active: boolean) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  totalStores: number;
}

export default function StoreFilters({
  searchQuery,
  setSearchQuery,
  showActiveOnly,
  setShowActiveOnly,
  itemsPerPage,
  setItemsPerPage,
  viewMode,
  setViewMode,
  totalStores
}: StoreFiltersProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
          <div>
            <Label htmlFor="search">Buscar tienda</Label>
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
            <Label htmlFor="items-per-page">Tiendas por página</Label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="6">6 tiendas</option>
              <option value="12">12 tiendas</option>
              <option value="24">24 tiendas</option>
              <option value="48">48 tiendas</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <button
              type="button"
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className="flex items-center gap-2"
            >
              {showActiveOnly ? (
                <ToggleRight className="h-5 w-5 text-blue-600" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm">Solo activas</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <Label className="text-sm">Vista:</Label>
            <div className="flex border rounded-md">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center mt-6">
            <span className="text-sm text-gray-600">
              {totalStores} tiendas en total
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}