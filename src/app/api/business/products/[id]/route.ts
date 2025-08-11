import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { BusinessServices } from '@/services';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre es muy largo').optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor a 0').optional(),
  stock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0').optional(),
  imageUrl: z.string().url().optional().or(z.literal('')).optional(),
  isActive: z.boolean().optional()
});

const stockUpdateSchema = z.object({
  action: z.enum(['set', 'increment', 'decrement']),
  quantity: z.number().int().min(0)
});

// GET - Get specific business product
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

    const product = await BusinessServices.BusinessProductService.getBusinessProduct(
      session.user.id, 
      id
    );

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error('Error fetching business product:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(
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
    const validatedData = updateProductSchema.parse(body);

    const product = await BusinessServices.BusinessProductService.updateProduct(
      session.user.id, 
      id,
      {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        stock: validatedData.stock,
        imageUrl: validatedData.imageUrl,
        isActive: validatedData.isActive
      }
    );

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error('Error updating business product:', error);
    
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

// PATCH - Update stock or toggle status
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

    // Handle stock updates
    if (body.action && ['set', 'increment', 'decrement'].includes(body.action)) {
      const validatedData = stockUpdateSchema.parse(body);
      let product;

      switch (validatedData.action) {
        case 'set':
          product = await BusinessServices.BusinessProductService.setProductStock(
            session.user.id, 
            id, 
            validatedData.quantity
          );
          break;
        case 'increment':
          product = await BusinessServices.BusinessProductService.updateProductStock(
            session.user.id, 
            id, 
            validatedData.quantity
          );
          break;
        case 'decrement':
          product = await BusinessServices.BusinessProductService.updateProductStock(
            session.user.id, 
            id, 
            -validatedData.quantity
          );
          break;
      }

      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    // Handle status toggle
    if (body.action === 'toggle') {
      const product = await BusinessServices.BusinessProductService.toggleProductStatus(
        session.user.id, 
        id
      );

      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error updating business product:', error);
    
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

// DELETE - Delete product (soft delete)
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const success = await BusinessServices.BusinessProductService.deleteProduct(
      session.user.id, 
      id
    );

    if (!success) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Producto eliminado exitosamente' });

  } catch (error) {
    console.error('Error deleting business product:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}