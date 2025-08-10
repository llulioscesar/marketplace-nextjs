import { Store, User } from '@prisma/client';
import StoreCard from './StoreCard';
import { ShoppingBag } from 'lucide-react';

type StoreWithRelations = Store & {
  business: Pick<User, 'name'>;
  _count: {
    products: number;
  };
};

interface StoreGridProps {
  stores: StoreWithRelations[];
}

export default function StoreGrid({ stores }: StoreGridProps) {
  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No hay tiendas disponibles en este momento</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}