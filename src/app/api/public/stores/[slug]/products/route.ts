import { NextResponse } from 'next/server';
import { CustomerServices } from '@/services';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const store = await CustomerServices.CustomerStoreService.getStoreBySlugWithProducts(slug);

    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('Error fetching store products:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
}