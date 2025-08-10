import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { StoreForm } from '@/components/business';

export const metadata: Metadata = {
  title: 'Editar Tienda - Dashboard',
  description: 'Editar información de la tienda'
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditStorePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <StoreForm mode="edit" storeId={id} />;
}