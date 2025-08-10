import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Marketplace',
  description: 'Panel de administración para negocios'
};

import { DashboardClient } from '@/components/business';

export default async function DashboardPage() {
    // Verificación del lado del servidor
    const session = await getServerSession(authOptions);

    // Doble verificación (el middleware ya lo hace, pero por si acaso)
    if (!session || session.user.role !== 'BUSINESS') {
        redirect('/unauthorized');
    }

    return <DashboardClient user={session.user} />;
}