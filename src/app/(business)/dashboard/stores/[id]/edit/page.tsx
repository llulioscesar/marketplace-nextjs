import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import { StoreForm } from '@/components/business';

export const metadata: Metadata = {
  title: 'Editar Tienda - Dashboard',
  description: 'Editar información de la tienda'
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStorePage({ params }: PageProps) {
  const session = await getAuthSession();
  const { id } = await params;

  if (!session || session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <StoreForm mode="edit" storeId={id} />;
}