'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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

interface OrdersTableProps {
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

export default function OrdersTable({ orders, onUpdateStatus }: OrdersTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const toggleRowExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
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
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">Orden</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Cliente</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Tienda</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Items</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Acciones</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        #{order.id.slice(-8)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {order.customer.name || 'Sin nombre'}
                        </span>
                        <span className="text-xs text-gray-600">
                          {order.customer.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {order.store.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusColor(order.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </div>
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {order.items.length} producto{order.items.length > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-green-600">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/orders/${order.id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                        
                        {order.status === 'PENDING' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onUpdateStatus(order.id, 'PROCESSING')}
                          >
                            <Package className="h-3 w-3" />
                          </Button>
                        )}
                        
                        {order.status === 'PROCESSING' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => toggleRowExpansion(order.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {expandedRows.has(order.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                  
                  {expandedRows.has(order.id) && (
                    <tr>
                      <td colSpan={9} className="py-0 px-4 bg-gray-50">
                        <div className="py-4 border-l-2 border-blue-200 pl-4 ml-2">
                          <h4 className="font-semibold text-sm mb-2">Productos en esta orden:</h4>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                                <div className="flex-1">
                                  <span className="font-medium">{item.product.name}</span>
                                  <span className="text-gray-600 ml-2">
                                    x{item.quantity} • {formatPrice(item.unitPrice)} c/u
                                  </span>
                                </div>
                                <span className="font-semibold">
                                  {formatPrice(item.totalPrice)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}