import type { Metadata } from 'next';
import { prisma } from '@/lib/db';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { name: true, description: true }
    });

    if (!store) {
      return {
        title: 'Tienda no encontrada - Marketplace'
      };
    }

    return {
      title: `${store.name} - Marketplace`,
      description: store.description || `Productos de ${store.name}`
    };
  } catch (error) {
    return {
      title: 'Tienda - Marketplace'
    };
  }
}

export default function StoreLayout({ children }: Props) {
  return children;
}