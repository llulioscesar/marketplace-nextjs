import type { Metadata } from 'next';
import { StoresListClient } from '@/components/customer/stores';

export const metadata: Metadata = {
  title: 'Tiendas - Marketplace',
  description: 'Explora todas las tiendas disponibles y sus productos'
};

export default function StoresPage() {
  return <StoresListClient />;
}