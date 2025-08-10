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
    const storeId = searchParams.get('storeId') || undefined;
    const status = searchParams.get('status') || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const orders = await BusinessServices.BusinessOrderService.getBusinessOrders(
      session.user.id,
      { storeId, status, startDate, endDate, limit, offset }
    );

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Error fetching business orders:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}