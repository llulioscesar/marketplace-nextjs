'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  User, 
  Store, 
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Package
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
    imageUrl: string | null;
  };
}

interface OrderData {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  items: OrderItem[];
  customer: {
    id: string;
    name: string | null;
    email: string | null;
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
}

interface OrdersGridProps {
  orders: OrderData[];
  onUpdateStatus: (orderId: string, newStatus: string) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-4 w-4" />;
    case 'PROCESSING':
      return <Package className="h-4 w-4" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4" />;
    case 'CANCELLED':
      return <XCircle className="h-4 w-4" />;
    default:
      return <ShoppingCart className="h-4 w-4" />;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pendiente';
    case 'PROCESSING':
      return 'Procesando';
    case 'COMPLETED':
      return 'Completada';
    case 'CANCELLED':
      return 'Cancelada';
    default:
      return status;
  }
};

const getStatusColor = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'PENDING':
      return 'outline';
    case 'PROCESSING':
      return 'secondary';
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function OrdersGrid({ orders, onUpdateStatus }: OrdersGridProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay órdenes</h3>
          <p className="text-gray-600">
            No se encontraron órdenes con los filtros seleccionados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                Orden #{order.id.slice(-8)}
              </CardTitle>
              <Badge variant={getStatusColor(order.status)}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(order.status)}
                  {getStatusLabel(order.status)}
                </div>
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {/* Cliente */}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">
                  {order.customer.name || order.customer.email}
                </span>
              </div>

              {/* Tienda */}
              <div className="flex items-center gap-2 text-sm">
                <Store className="h-4 w-4 text-gray-500" />
                <span>{order.store.name}</span>
              </div>

              {/* Fecha */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(order.createdAt)}</span>
              </div>

              {/* Items */}
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">
                  {order.items.length} producto{order.items.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="text-xs text-gray-600 flex justify-between">
                      <span className="truncate flex-1 mr-2">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="whitespace-nowrap">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{order.items.length - 2} producto{order.items.length - 2 > 1 ? 's' : ''} más
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg text-green-600">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Link>
                </Button>
                
                {order.status === 'PENDING' && (
                  <Button 
                    size="sm" 
                    onClick={() => onUpdateStatus(order.id, 'PROCESSING')}
                    className="flex-1"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    Procesar
                  </Button>
                )}
                
                {order.status === 'PROCESSING' && (
                  <Button 
                    size="sm" 
                    onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completar
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}