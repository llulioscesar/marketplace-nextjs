import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { CustomerServices } from '@/services';

// GET - Get specific customer order
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const order = await CustomerServices.CustomerOrderService.getCustomerOrder(
      session.user.id, 
      id
    );

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Error fetching customer order:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// PATCH - Cancel order
export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    if (body.action === 'cancel') {
      const success = await CustomerServices.CustomerOrderService.cancelOrder(
        session.user.id, 
        id
      );

      if (!success) {
        return NextResponse.json({ 
          error: 'No se pudo cancelar la orden. Verifica que esté en estado cancelable.' 
        }, { status: 400 });
      }

      return NextResponse.json({ message: 'Orden cancelada exitosamente' });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error updating customer order:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}