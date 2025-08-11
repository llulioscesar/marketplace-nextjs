import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import { StoreForm } from '@/components/business';

export const metadata: Metadata = {
  title: 'Nueva Tienda - Dashboard',
  description: 'Crear una nueva tienda'
};

export default async function NewStorePage() {
  const session = await getAuthSession();

  if (!session || session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <StoreForm mode="create" />;
}