import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { BusinessServices } from '@/services';
import { z } from 'zod';

const bulkUpdateStockSchema = z.object({
  updates: z.array(z.object({
    productId: z.string(),
    stock: z.number().int().min(0)
  }))
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = bulkUpdateStockSchema.parse(body);

    const success = await BusinessServices.BusinessProductService.bulkUpdateStock(
      session.user.id,
      validatedData.updates
    );

    if (!success) {
      return NextResponse.json({ 
        error: 'Error actualizando el stock. Verifica que todos los productos pertenezcan a tu negocio.' 
      }, { status: 400 });
    }

    return NextResponse.json({ message: 'Stock actualizado exitosamente para todos los productos' });

  } catch (error) {
    console.error('Error bulk updating product stock:', error);
    
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