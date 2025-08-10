'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Store, User } from '@prisma/client';

type StoreWithBusiness = Store & {
  business: Pick<User, 'name'>;
};

interface StoreHeaderProps {
  store: StoreWithBusiness;
}

export default function StoreHeader({ store }: StoreHeaderProps) {
  const router = useRouter();

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => router.push('/stores')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a tiendas
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
        {store.description && (
          <p className="text-gray-600 mb-2">{store.description}</p>
        )}
        <p className="text-sm text-gray-500">
          Vendido por: {store.business.name}
        </p>
      </div>
    </>
  );
}