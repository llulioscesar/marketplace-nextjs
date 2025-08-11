import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { OrderDetailWrapper } from '@/components/business/OrderDetailWrapper';

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'BUSINESS') {
    redirect('/unauthorized');
  }

  return <OrderDetailWrapper orderId={params.id} user={session.user} />;
}

export const metadata = {
  title: 'Detalle de Orden - Dashboard',
  description: 'Ver detalles completos de la orden',
};