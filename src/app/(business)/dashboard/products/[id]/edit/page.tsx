import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductForm } from '@/components/business';

export const metadata: Metadata = {
  title: 'Editar Producto - Dashboard',
  description: 'Editar información del producto'
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <ProductForm mode="edit" productId={id} />;
}