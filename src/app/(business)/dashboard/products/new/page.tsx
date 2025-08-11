import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import type { Metadata } from 'next';
import { ProductForm } from '@/components/business';

export const metadata: Metadata = {
  title: 'Nuevo Producto - Dashboard',
  description: 'Crear nuevo producto'
};

export default async function NewProductPage() {
  const session = await getAuthSession();

  if (!session || session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <ProductForm mode="create" />;
}