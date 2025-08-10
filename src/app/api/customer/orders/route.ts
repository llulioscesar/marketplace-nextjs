import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { CustomerServices } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const orders = await CustomerServices.CustomerOrderService.getOrderHistory(
      session.user.id,
      { status, limit, offset }
    );

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}