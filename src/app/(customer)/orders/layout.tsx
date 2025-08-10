import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mis Órdenes - Marketplace',
  description: 'Historial de tus pedidos y compras'
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}