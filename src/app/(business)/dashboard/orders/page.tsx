import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth/server';
import OrdersManagementClient from '@/components/business/OrdersManagementClient';

export default async function OrdersPage() {
  const session = await getAuthSession();

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