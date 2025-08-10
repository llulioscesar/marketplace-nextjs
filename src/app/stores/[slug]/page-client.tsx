'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { StoreHeader, ProductGrid, ProductLoadingSkeleton } from '@/components/shared';
import { useStore, useAddToCart } from '@/hooks';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function StoreProductsPageClient({ params }: Props) {
  const resolvedParams = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const addToCartMutation = useAddToCart();
  
  const slug = resolvedParams.slug as string;
  const { data: store, isLoading, error } = useStore(slug);

  const handleAddToCart = (product: any) => {
    if (!session) {
      toast.error('Debes iniciar sesión para comprar', {richColors: true});
      router.push('/login');
      return;
    }

    if (session.user?.role !== 'CUSTOMER') {
      toast.error('Solo los clientes pueden realizar compras', {richColors: true});
      return;
    }

    addToCartMutation.mutate({
      ...product,
      store: store,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 h-4 bg-gray-200 animate-pulse rounded w-32"></div>
        <div className="mb-8">
          <div className="h-8 bg-gray-200 animate-pulse rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 animate-pulse rounded w-96"></div>
        </div>
        <ProductLoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar la tienda</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <StoreHeader store={store} />
      <ProductGrid products={store.products} onAddToCart={handleAddToCart} />
    </div>
  );
}