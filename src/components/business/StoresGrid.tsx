'use client';

import StoreCard from './StoreCard';

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

interface StoresGridProps {
  stores: StoreData[];
  onToggleStatus: (storeId: string, currentStatus: boolean) => void;
  onDelete: (storeId: string, storeName: string) => void;
}

export default function StoresGrid({ stores, onToggleStatus, onDelete }: StoresGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stores.map((store) => (
        <StoreCard
          key={store.id}
          store={store}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}