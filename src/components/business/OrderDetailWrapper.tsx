'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import OrderDetailClient from './OrderDetailClient';
import { useOrder } from '@/hooks/business/useOrders';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

interface OrderDetailWrapperProps {
  orderId: string;
  user: User;
}

export function OrderDetailWrapper({ orderId, user }: OrderDetailWrapperProps) {
  const { 
    data: order, 
    isLoading, 
    error,
    refetch
  } = useOrder(orderId);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <Link href="/dashboard/orders" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Órdenes
          </Link>
          <h1 className="text-3xl font-bold mb-2">Cargando orden...</h1>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Loading skeleton for main content */}
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <Link href="/dashboard/orders" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Órdenes
          </Link>
          <h1 className="text-3xl font-bold mb-2">Error al cargar orden</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              {error.message || 'Error inesperado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {error.message?.includes('no encontrada') ? 
                'La orden solicitada no existe o ha sido eliminada.' :
                error.message?.includes('permisos') ?
                'No tienes permisos para acceder a esta orden.' :
                'Ocurrió un error al cargar los detalles de la orden. Por favor, intenta nuevamente.'
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/orders">
                <Button variant="outline">
                  Volver a Órdenes
                </Button>
              </Link>
              {!error.message?.includes('no encontrada') && !error.message?.includes('permisos') && (
                <Button onClick={() => refetch()}>
                  Reintentar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (!order) {
    return (
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <Link href="/dashboard/orders" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a Órdenes
          </Link>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No se pudo cargar la información de la orden.</p>
            <Link href="/dashboard/orders" className="inline-block mt-4">
              <Button variant="outline">Volver a Órdenes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <OrderDetailClient order={order} user={user} />;
}