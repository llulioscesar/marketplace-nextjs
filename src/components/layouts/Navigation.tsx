'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Store, LogOut, User, LayoutDashboard, Package } from 'lucide-react';
import { CartButton } from '@/components/cart';
import { useAuth } from '@/hooks/useAuth';

export default function Navigation() {
  const { user, isAuthenticated, isBusiness, isCustomer } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6" />
              <span className="font-bold text-xl">Marketplace</span>
            </Link>
            
            <Link href="/stores" className="flex items-center space-x-2 hover:text-primary">
              <Store className="h-4 w-4" />
              <span>Tiendas</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isBusiness ? (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <CartButton />
                    <Link href="/orders">
                      <Button variant="ghost" size="sm">
                        <Package className="h-4 w-4 mr-2" />
                        Mis Órdenes
                      </Button>
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.name}</span>
                  <span className="text-xs bg-primary/10 px-2 py-1 rounded">
                    {isBusiness ? 'Negocio' : 'Cliente'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}