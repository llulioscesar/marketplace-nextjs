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