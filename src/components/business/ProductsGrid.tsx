'use client';

import { Badge } from '@/components/ui/badge';
import ProductCard from './ProductCard';

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

interface ProductsGridProps {
  products: ProductWithStore[];
  stores: Store[];
  selectedStore: string;
  onToggleStatus: (productId: string, currentStatus: boolean) => void;
  onDelete: (productId: string, productName: string) => void;
}

export default function ProductsGrid({ 
  products, 
  stores, 
  selectedStore, 
  onToggleStatus, 
  onDelete 
}: ProductsGridProps) {
  if (!selectedStore) {
    // Group by store when no specific store is selected
    return (
      <div className="space-y-6">
        {stores.map((store) => {
          const storeProducts = products.filter(product => product.store.id === store.id);
          if (storeProducts.length === 0) return null;

          return (
            <div key={store.id}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold">{store.name}</h2>
                <Badge variant="secondary">{storeProducts.length} productos</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {storeProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Show products in simple grid when a specific store is selected
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}