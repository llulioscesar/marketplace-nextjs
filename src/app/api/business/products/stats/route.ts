import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { BusinessServices } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get('threshold') || '5');

    const [productStats, lowStockProducts, outOfStockProducts] = await Promise.all([
      BusinessServices.BusinessProductService.getBusinessProductStats(session.user.id),
      BusinessServices.BusinessProductService.getLowStockProducts(session.user.id, threshold),
      BusinessServices.BusinessProductService.getOutOfStockProducts(session.user.id)
    ]);

    return NextResponse.json({
      stats: productStats,
      lowStockProducts,
      outOfStockProducts
    });

  } catch (error) {
    console.error('Error fetching business product stats:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}