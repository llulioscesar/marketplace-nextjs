import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Marketplace',
  description: 'Panel de administración para negocios'
};

export default async function DashboardPage() {
    // Verificación del lado del servidor
    const session = await getServerSession(authOptions);

    // Doble verificación (el middleware ya lo hace, pero por si acaso)
    if (!session || session.user.role !== 'BUSINESS') {
        redirect('/unauthorized');
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">
                Dashboard de Negocio
            </h1>
            <p>Bienvenido, {session.user.name}</p>
            <p>Tu rol es: {session.user.role}</p>

            {/* Aquí va el contenido del dashboard */}
        </div>
    );
}