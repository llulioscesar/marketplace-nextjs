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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' || 'month';
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    const [salesReport, orderStats] = await Promise.all([
      BusinessServices.BusinessOrderService.getSalesReport(session.user.id, period),
      BusinessServices.BusinessOrderService.getBusinessOrderStats(session.user.id, { startDate, endDate })
    ]);

    return NextResponse.json({
      salesReport,
      orderStats
    });

  } catch (error) {
    console.error('Error fetching business reports:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}