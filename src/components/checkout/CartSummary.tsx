'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart, useUpdateCartQuantity, useRemoveFromCart } from '@/hooks';
import { formatPriceCOP } from '@/lib/utils/currency.utils';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function CartSummary() {
  const { items, total } = useCart();
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeFromCartMutation = useRemoveFromCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCartMutation.mutate(productId);
      return;
    }

    const item = items.find(item => item.productId === productId);
    if (item && newQuantity <= item.stock) {
      updateQuantityMutation.mutate({ productId, quantity: newQuantity });
    }
  };

  const handleInputChange = (productId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities(prev => ({ ...prev, [productId]: numValue }));
  };

  const handleInputBlur = (productId: string) => {
    const newQuantity = quantities[productId];
    if (newQuantity !== undefined) {
      handleQuantityChange(productId, newQuantity);
      setQuantities(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    }
  };

  const getCurrentQuantity = (productId: string) => {
    return quantities[productId] ?? items.find(item => item.productId === productId)?.quantity ?? 0;
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Tu carrito está vacío</p>
        </CardContent>
      </Card>
    );
  }

  // Group items by store
  const itemsByStore = items.reduce((acc, item) => {
    const storeId = item.storeId;
    if (!acc[storeId]) {
      acc[storeId] = {
        storeName: item.storeName,
        items: []
      };
    }
    acc[storeId].items.push(item);
    return acc;
  }, {} as Record<string, { storeName: string; items: typeof items }>);

  return (
    <div className="space-y-6">
      {Object.entries(itemsByStore).map(([storeId, { storeName, items: storeItems }]) => (
        <Card key={storeId}>
          <CardHeader>
            <CardTitle className="text-lg">
              <Badge variant="outline" className="mr-2">Tienda</Badge>
              {storeName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {storeItems.map((item) => {
              const currentQuantity = getCurrentQuantity(item.productId);
              const itemTotal = item.price * currentQuantity;

              return (
                <div key={item.productId} className="flex items-center gap-4 p-4 border rounded-lg">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {formatPriceCOP(item.price)} c/u
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock disponible: {item.stock}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.productId, currentQuantity - 1)}
                      disabled={currentQuantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <Input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={getCurrentQuantity(item.productId)}
                      onChange={(e) => handleInputChange(item.productId, e.target.value)}
                      onBlur={() => handleInputBlur(item.productId)}
                      className="w-16 text-center"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.productId, currentQuantity + 1)}
                      disabled={currentQuantity >= item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCartMutation.mutate(item.productId)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">{formatPriceCOP(itemTotal)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total:</span>
            <span>{formatPriceCOP(total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}