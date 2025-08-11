'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart, useCheckout } from '@/hooks';
import { useAuth } from '@/hooks/auth/useAuth';
import { formatPriceCOP } from '@/lib/utils/currency.utils';
import { ShoppingBag, User, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderData {
  storeId: string;
  storeName: string;
  storeSlug: string;
  items: OrderItem[];
}

export default function CheckoutForm() {
  const { items, total, itemCount } = useCart();
  const { user } = useAuth();
  const checkoutMutation = useCheckout();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;

    // Group items by store to create separate orders for each store
    const ordersByStore = items.reduce((acc, item) => {
      const storeId = item.storeId;
      if (!acc[storeId]) {
        acc[storeId] = {
          storeId,
          storeName: item.storeName,
          storeSlug: item.storeSlug,
          items: []
        };
      }
      acc[storeId].items.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      });
      return acc;
    }, {} as Record<string, OrderData>);

    // Process each store order
    for (const [storeId, orderData] of Object.entries(ordersByStore)) {
      const orderTotal = orderData.items.reduce((sum: number, item: OrderItem) => sum + item.totalPrice, 0);
      
      const order = {
        items: orderData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          storeId: storeId
        }))
      };

      try {
        await checkoutMutation.mutateAsync(order);
      } catch (error) {
        console.error('Error processing order for store:', orderData.storeName, error);
        return;
      }
    }

    // Redirect to orders page on success
    router.push('/orders');
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Resumen de Compra
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span>Cliente: {user?.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>Entrega: Retiro en tienda</span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Productos ({itemCount})</span>
            <span>{formatPriceCOP(total)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Envío</span>
            <span className="text-green-600">Gratis</span>
          </div>
          
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPriceCOP(total)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Los productos se entregarán por separado según la tienda</p>
            <p>• Cada tienda procesará su orden independientemente</p>
            <p>• Recibirás confirmación por cada pedido</p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleCheckout}
            disabled={checkoutMutation.isPending || items.length === 0}
          >
            {checkoutMutation.isPending ? 'Procesando...' : 'Finalizar Compra'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}