import { NextResponse } from 'next/server';
import { CustomerServices } from '@/services';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await CustomerServices.CustomerStoreService.getAllStores({ page, limit });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Error al obtener las tiendas' },
      { status: 500 }
    );
  }
}