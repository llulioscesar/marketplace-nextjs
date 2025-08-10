'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, ShoppingBag, Package, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

interface DashboardStats {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    customer: {
      name: string;
    };
    store: {
      name: string;
    };
  }>;
}

interface DashboardProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/business/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard de Negocio</h1>
          <p className="text-gray-600">Gestiona tus tiendas, productos y órdenes</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'secondary',
    PROCESSING: 'default',
    COMPLETED: 'default',
    CANCELLED: 'destructive'
  } as const;

  const statusLabels = {
    PENDING: 'Pendiente',
    PROCESSING: 'Procesando',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado'
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard de Negocio</h1>
            <p className="text-gray-600">Bienvenido, {user.name}</p>
          </div>
          <Link href="/dashboard/stores/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tienda
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tiendas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStores || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.totalRevenue || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Gestiona tu negocio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/stores" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Store className="h-4 w-4 mr-2" />
                Gestionar Tiendas
              </Button>
            </Link>
            <Link href="/dashboard/products" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Gestionar Productos
              </Button>
            </Link>
            <Link href="/dashboard/orders" className="block">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Ver Órdenes
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Órdenes Recientes</CardTitle>
            <CardDescription>Últimas órdenes recibidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.length ? (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {order.customer.name} - {order.store.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.totalAmount.toLocaleString()}</p>
                      <Badge variant={statusColors[order.status as keyof typeof statusColors]}>
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay órdenes recientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}