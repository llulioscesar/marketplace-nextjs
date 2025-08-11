import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { CustomerServices } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const stats = await CustomerServices.CustomerOrderService.getCustomerOrderStats(
      session.user.id
    );

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}