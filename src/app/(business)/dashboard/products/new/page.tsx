import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductForm } from '@/components/business';

export const metadata: Metadata = {
  title: 'Nuevo Producto - Dashboard',
  description: 'Crear nuevo producto'
};

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <ProductForm mode="create" />;
}