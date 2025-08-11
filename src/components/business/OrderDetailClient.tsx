'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Package, 
  Calendar, 
  CreditCard,
  CheckCircle,
  Clock,
  Loader2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatPriceCOP } from '@/lib/utils/currency.utils';
import { useUpdateOrderStatus } from '@/hooks/business/useOrders';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  shippingAddress?: string;
  notes?: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
  items: OrderItem[];
}

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

interface OrderDetailClientProps {
  order: Order;
  user: User;
}

const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    variant: 'secondary' as const,
    icon: Clock,
    color: 'text-yellow-600'
  },
  PROCESSING: {
    label: 'Procesando',
    variant: 'default' as const,
    icon: Package,
    color: 'text-blue-600'
  },
  COMPLETED: {
    label: 'Completado',
    variant: 'default' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  CANCELLED: {
    label: 'Cancelado',
    variant: 'destructive' as const,
    icon: XCircle,
    color: 'text-red-600'
  }
};

export default function OrderDetailClient({ order, user }: OrderDetailClientProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const updateOrderStatusMutation = useUpdateOrderStatus();

  const handleStatusUpdate = async (action: 'process' | 'complete' | 'cancel') => {
    setIsUpdating(true);
    try {
      await updateOrderStatusMutation.mutateAsync({
        orderId: order.id,
        action
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <Link href="/dashboard/orders" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Órdenes
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Orden #{order.orderNumber}</h1>
            <p className="text-gray-600">Detalle completo de la orden</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant} className="text-sm">
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{order.customer.email}</p>
                </div>
              </div>
              {order.shippingAddress && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Dirección de envío</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm">{order.shippingAddress}</p>
                  </div>
                </div>
              )}
              {order.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Notas del cliente</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {item.product.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>Cantidad: {item.quantity}</span>
                        <span>Precio unitario: {formatPriceCOP(item.unitPrice)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPriceCOP(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total</span>
                <span className="text-green-600">{formatPriceCOP(order.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Información de la orden */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información de la Orden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Tienda</p>
                <p className="text-sm">{order.store.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
                <p className="text-sm">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Última actualización</p>
                <p className="text-sm">{formatDate(order.updatedAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Estado actual</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                  <span className="text-sm font-medium">{statusInfo.label}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === 'PENDING' && (
                <Button
                  onClick={() => handleStatusUpdate('process')}
                  disabled={isUpdating}
                  className="w-full"
                  variant="default"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Package className="h-4 w-4 mr-2" />
                  )}
                  Marcar como Procesando
                </Button>
              )}
              
              {order.status === 'PROCESSING' && (
                <Button
                  onClick={() => handleStatusUpdate('complete')}
                  disabled={isUpdating}
                  className="w-full"
                  variant="default"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Marcar como Completado
                </Button>
              )}

              {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                <Button
                  onClick={() => handleStatusUpdate('cancel')}
                  disabled={isUpdating}
                  className="w-full"
                  variant="destructive"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Cancelar Orden
                </Button>
              )}

              {order.status === 'COMPLETED' && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Orden completada exitosamente</p>
                </div>
              )}

              {order.status === 'CANCELLED' && (
                <div className="text-center py-4">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Esta orden ha sido cancelada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}