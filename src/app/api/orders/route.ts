import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { CustomerServices, BusinessServices } from '@/services';
import { z } from 'zod';

const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    storeId: z.string()
  })),
  shippingAddress: z.string().optional(),
  notes: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = checkoutSchema.parse(body);

    // Process checkout using CustomerCheckoutService
    const result = await CustomerServices.CustomerCheckoutService.processCheckout({
      items: validatedData.items,
      customerId: session.user.id,
      shippingAddress: validatedData.shippingAddress,
      notes: validatedData.notes
    });

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Error en el checkout',
        details: result.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderIds: result.orderIds,
      message: 'Órdenes creadas exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Datos de checkout inválidos',
        details: error.issues
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let orders;
    
    // Customers can only see their own orders
    if (session.user.role === 'CUSTOMER') {
      orders = await CustomerServices.CustomerOrderService.getOrderHistory(
        session.user.id,
        { status, limit, offset }
      );
    }
    // Business users can see orders from their stores
    else if (session.user.role === 'BUSINESS') {
      orders = await BusinessServices.BusinessOrderService.getBusinessOrders(
        session.user.id,
        { status, limit, offset }
      );
    } else {
      return NextResponse.json({ error: 'Rol no autorizado' }, { status: 403 });
    }

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}