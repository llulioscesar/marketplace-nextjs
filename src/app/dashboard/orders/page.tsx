import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import OrdersManagementClient from '@/components/business/OrdersManagementClient';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'BUSINESS') {
    redirect('/dashboard');
  }

  return <OrdersManagementClient user={session.user} />;
}

export const metadata = {
  title: 'Gestión de Órdenes - Dashboard',
  description: 'Administra todas las órdenes de tus tiendas',
};