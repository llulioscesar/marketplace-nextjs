import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createOrderSchema = z.object({
  customerId: z.string(),
  storeId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0)
  })),
  totalAmount: z.number().min(0)
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    // Verify that the customer matches the session
    if (validatedData.customerId !== session.user.id) {
      return NextResponse.json({ error: 'Cliente no válido' }, { status: 403 });
    }

    // Verify store exists and get business info
    const store = await prisma.store.findUnique({
      where: { id: validatedData.storeId },
      include: { business: true }
    });

    if (!store || !store.isActive) {
      return NextResponse.json({ error: 'Tienda no encontrada o inactiva' }, { status: 404 });
    }

    // Verify all products exist and have sufficient stock
    const productIds = validatedData.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        storeId: validatedData.storeId,
        isActive: true
      }
    });

    if (products.length !== validatedData.items.length) {
      return NextResponse.json({ error: 'Algunos productos no están disponibles' }, { status: 400 });
    }

    // Check stock and validate prices
    for (const orderItem of validatedData.items) {
      const product = products.find(p => p.id === orderItem.productId);
      if (!product) {
        return NextResponse.json({ 
          error: `Producto no encontrado: ${orderItem.productId}` 
        }, { status: 400 });
      }

      if (product.stock < orderItem.quantity) {
        return NextResponse.json({ 
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${orderItem.quantity}` 
        }, { status: 400 });
      }

      // Validate price
      const expectedPrice = Number(product.price);
      if (Math.abs(orderItem.unitPrice - expectedPrice) > 0.01) {
        return NextResponse.json({ 
          error: `Precio incorrecto para ${product.name}` 
        }, { status: 400 });
      }
    }

    // Create order and order items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          customerId: validatedData.customerId,
          storeId: validatedData.storeId,
          totalAmount: validatedData.totalAmount,
          status: 'PENDING'
        }
      });

      // Create order items and update product stock
      for (const orderItem of validatedData.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: orderItem.productId,
            quantity: orderItem.quantity,
            unitPrice: orderItem.unitPrice,
            totalPrice: orderItem.totalPrice
          }
        });

        // Update product stock
        await tx.product.update({
          where: { id: orderItem.productId },
          data: {
            stock: {
              decrement: orderItem.quantity
            }
          }
        });
      }

      return order;
    });

    // Return order with related data
    const orderWithDetails = await prisma.order.findUnique({
      where: { id: result.id },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        store: {
          select: { 
            id: true, 
            name: true, 
            slug: true,
            business: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true }
            }
          }
        }
      }
    });

    return NextResponse.json(orderWithDetails, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Datos de orden inválidos',
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let whereCondition = {};
    
    // Customers can only see their own orders
    if (session.user.role === 'CUSTOMER') {
      whereCondition = { customerId: session.user.id };
    }
    // Business users can see orders from their stores
    else if (session.user.role === 'BUSINESS') {
      whereCondition = {
        store: {
          businessId: session.user.id
        }
      };
    }

    const [orders, totalOrders] = await Promise.all([
      prisma.order.findMany({
        where: whereCondition,
        include: {
          customer: {
            select: { id: true, name: true, email: true }
          },
          store: {
            select: { 
              id: true, 
              name: true, 
              slug: true,
              business: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          items: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}