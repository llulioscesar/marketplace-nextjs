'use client';

import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export function Navigation() {
    const { user, isAuthenticated, isCustomer, isBusiness } = useAuth();

    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="font-bold text-xl">
                        Marketplace
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Links públicos */}
                        <Link href="/stores" className="hover:text-blue-500">
                            Tiendas
                        </Link>

                        {!isAuthenticated ? (
                            <>
                                <Link href="/login" className="hover:text-blue-500">
                                    Iniciar Sesión
                                </Link>
                                <Link href="/register" className="bg-blue-500 text-white px-4 py-2 rounded">
                                    Registrarse
                                </Link>
                            </>
                        ) : (
                            <>
                                {/* Links para CUSTOMER */}
                                {isCustomer && (
                                    <>
                                        <Link href="/my-orders" className="hover:text-blue-500">
                                            Mis Pedidos
                                        </Link>
                                    </>
                                )}

                                {/* Links para BUSINESS */}
                                {isBusiness && (
                                    <>
                                        <Link href="/dashboard" className="hover:text-blue-500">
                                            Dashboard
                                        </Link>
                                        <Link href="/dashboard/stores" className="hover:text-blue-500">
                                            Mis Tiendas
                                        </Link>
                                    </>
                                )}

                                <span className="text-gray-600">
                  {user?.name} ({user?.role})
                </span>

                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Cerrar Sesión
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}