import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout - Marketplace',
  description: 'Finaliza tu compra de forma segura'
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}