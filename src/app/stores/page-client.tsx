'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Pagination } from '@/components/common';
import { StoreGrid } from '@/components/stores';
import { StoreLoadingSkeleton } from '@/components/common/LoadingSkeletons';
import { useStores } from '@/hooks';

export default function StoresPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  const { data, isLoading, error } = useStores(currentPage, 10);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/stores?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tiendas Disponibles</h1>
          <p className="text-gray-600">Explora todas las tiendas y sus productos</p>
        </div>
        <StoreLoadingSkeleton count={10} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar tiendas</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tiendas Disponibles</h1>
        <p className="text-gray-600">Explora todas las tiendas y sus productos</p>
      </div>

      <StoreGrid stores={data?.stores || []} />
      
      {data?.pagination && (
        <div className="mt-12">
          <Pagination
            currentPage={data.pagination.currentPage}
            totalPages={data.pagination.totalPages}
            hasNextPage={data.pagination.hasNext}
            hasPreviousPage={data.pagination.hasPrev}
            totalItems={data.pagination.totalStores}
            itemsPerPage={10}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}