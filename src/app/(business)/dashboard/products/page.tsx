import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import type { Metadata } from 'next';
import { ProductsManagementClient } from '@/components/business';

export const metadata: Metadata = {
  title: 'Productos - Dashboard',
  description: 'Gestión de productos por tienda'
};

export default async function ProductsPage() {
  const session = await getAuthSession();

  if (!session || session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <ProductsManagementClient user={session.user} />;
}