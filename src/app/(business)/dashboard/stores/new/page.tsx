import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { StoreForm } from '@/components/business';

export const metadata: Metadata = {
  title: 'Nueva Tienda - Dashboard',
  description: 'Crear una nueva tienda'
};

export default async function NewStorePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <StoreForm mode="create" />;
}