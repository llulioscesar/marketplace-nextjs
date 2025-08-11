import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import { StoresManagementClient } from '@/components/business';

export const metadata: Metadata = {
  title: 'Gestión de Tiendas - Dashboard',
  description: 'Administra tus tiendas'
};

export default async function StoresManagementPage() {
  const session = await getAuthSession();

  if (!session || session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <StoresManagementClient user={session.user} />;
}