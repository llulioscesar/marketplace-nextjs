import { redirect } from 'next/navigation';
import { isBusiness, getAuthSession } from '@/lib/auth/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Marketplace',
  description: 'Panel de administración para negocios'
};

import { DashboardClient } from '@/components/business';

export default async function DashboardPage() {
    // Verificación del lado del servidor
    const isAuth = await isBusiness();
    const session = await getAuthSession();

    // Doble verificación (el middleware ya lo hace, pero por si acaso)
    if (!isAuth) {
        redirect('/unauthorized');
    }

    return <DashboardClient user={session!.user} />;
}