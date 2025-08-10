'use client';

import { useCart } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';
import { CartSummary, CheckoutForm } from '@/components/checkout';

export default function CheckoutPage() {
  const { isAuthenticated, isCustomer } = useAuth();
  const { itemCount } = useCart();

  // Redirect if not authenticated or not a customer
  if (!isAuthenticated) {
    redirect('/login');
  }

  if (!isCustomer) {
    redirect('/');
  }

  // Redirect if cart is empty
  if (itemCount === 0) {
    redirect('/stores');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600">Revisa tu pedido antes de finalizar la compra</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CartSummary />
        </div>
        
        <div className="lg:col-span-1">
          <CheckoutForm />
        </div>
      </div>
    </div>
  );
}