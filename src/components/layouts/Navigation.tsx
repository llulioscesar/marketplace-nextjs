'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Store, LogOut, User, LayoutDashboard, Package, Menu, X } from 'lucide-react';
import { CartButton } from '@/components/customer/cart';
import { useAuth } from '@/hooks/auth/useAuth';

export default function Navigation() {
  const { user, isAuthenticated, isBusiness, isCustomer } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop and Mobile Header */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <ShoppingBag className="h-6 w-6" />
            <span className="font-bold text-xl">Marketplace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/stores" className="flex items-center space-x-2 hover:text-primary transition-colors">
              <Store className="h-4 w-4" />
              <span>Tiendas</span>
            </Link>

            {/* Desktop User Section */}
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
                  <div className="hidden xl:flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm truncate max-w-32">{user?.name}</span>
                    <span className="text-xs bg-primary/10 px-2 py-1 rounded whitespace-nowrap">
                      {isBusiness ? 'Negocio' : 'Cliente'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    title="Cerrar Sesión"
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

          {/* Mobile Cart + Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            {isAuthenticated && isCustomer && <CartButton />}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="lg:hidden"
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t">
            <div className="pt-4 space-y-3">
              {/* Public Links */}
              <Link 
                href="/stores" 
                className="flex items-center space-x-2 px-2 py-2 hover:bg-muted rounded-md transition-colors"
                onClick={closeMenu}
              >
                <Store className="h-4 w-4" />
                <span>Tiendas</span>
              </Link>

              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-2 px-2 py-2 bg-muted/50 rounded-md">
                    <User className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-sm font-medium truncate">{user?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {isBusiness ? 'Cuenta de Negocio' : 'Cuenta de Cliente'}
                      </div>
                    </div>
                  </div>

                  {/* Role-specific Links */}
                  {isBusiness ? (
                    <Link 
                      href="/dashboard"
                      className="flex items-center space-x-2 px-2 py-2 hover:bg-muted rounded-md transition-colors"
                      onClick={closeMenu}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  ) : (
                    <Link 
                      href="/orders"
                      className="flex items-center space-x-2 px-2 py-2 hover:bg-muted rounded-md transition-colors"
                      onClick={closeMenu}
                    >
                      <Package className="h-4 w-4" />
                      <span>Mis Órdenes</span>
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      closeMenu();
                    }}
                    className="flex items-center space-x-2 px-2 py-2 hover:bg-muted rounded-md transition-colors w-full text-left text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="flex items-center justify-center px-2 py-2 hover:bg-muted rounded-md transition-colors"
                    onClick={closeMenu}
                  >
                    <Button variant="ghost" size="sm" className="w-full">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link 
                    href="/register"
                    className="flex items-center justify-center px-2 py-2"
                    onClick={closeMenu}
                  >
                    <Button size="sm" className="w-full">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}