import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { StoresManagementClient } from '@/components/business';

export const metadata: Metadata = {
  title: 'Gestión de Tiendas - Dashboard',
  description: 'Administra tus tiendas'
};

export default async function StoresManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <StoresManagementClient user={session.user} />;
}