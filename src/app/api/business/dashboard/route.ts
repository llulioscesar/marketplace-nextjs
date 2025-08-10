import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { BusinessServices } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const businessId = session.user.id;

    // Get comprehensive dashboard statistics using services
    const [storeStats, productStats, orderStats] = await Promise.all([
      BusinessServices.BusinessStoreService.getBusinessStoreStats(businessId),
      BusinessServices.BusinessProductService.getBusinessProductStats(businessId),
      BusinessServices.BusinessOrderService.getBusinessOrderStats(businessId)
    ]);

    return NextResponse.json({
      totalStores: storeStats.totalStores,
      totalProducts: productStats.totalProducts,
      totalOrders: orderStats.totalOrders,
      totalRevenue: orderStats.totalRevenue,
      recentOrders: orderStats.recentOrders
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}