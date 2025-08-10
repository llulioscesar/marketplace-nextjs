import type { Metadata } from 'next';
import StoresPageClient from './page-client';

export const metadata: Metadata = {
  title: 'Tiendas - Marketplace',
  description: 'Explora todas las tiendas disponibles y sus productos'
};

export default function StoresPage() {
  return <StoresPageClient />;
}