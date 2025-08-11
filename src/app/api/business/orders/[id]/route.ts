import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { BusinessServices } from '@/services';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']).optional(),
  action: z.enum(['process', 'complete', 'cancel']).optional()
});

// GET - Get specific business order
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const order = await BusinessServices.BusinessOrderService.getBusinessOrder(
      session.user.id, 
      id
    );

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Error fetching business order:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// PATCH - Update order status
export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateOrderSchema.parse(body);

    let success = false;

    if (validatedData.action) {
      switch (validatedData.action) {
        case 'process':
          success = await BusinessServices.BusinessOrderService.markAsProcessed(
            session.user.id, 
            id
          );
          break;
        case 'complete':
          success = await BusinessServices.BusinessOrderService.markAsCompleted(
            session.user.id, 
            id
          );
          break;
        case 'cancel':
          success = await BusinessServices.BusinessOrderService.cancelOrder(
            session.user.id, 
            id
          );
          break;
      }
    } else if (validatedData.status) {
      success = await BusinessServices.BusinessOrderService.updateOrderStatus(
        session.user.id, 
        id, 
        validatedData.status
      );
    }

    if (!success) {
      return NextResponse.json({ 
        error: 'No se pudo actualizar la orden. Verifica que pertenezca a tu negocio y esté en estado válido.' 
      }, { status: 400 });
    }

    return NextResponse.json({ message: 'Orden actualizada exitosamente' });

  } catch (error) {
    console.error('Error updating business order:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Datos inválidos',
        details: error.issues
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}