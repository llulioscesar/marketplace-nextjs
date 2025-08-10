import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { BusinessServices } from '@/services';
import { z } from 'zod';

const updateStoreSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo').optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')).optional(),
  isActive: z.boolean().optional(),
});

// GET - Get specific store
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const store = await BusinessServices.BusinessStoreService.getBusinessStore(session.user.id, id);

    if (!store) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    return NextResponse.json(store);

  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// PUT - Update store
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateStoreSchema.parse(body);

    const updatedStore = await BusinessServices.BusinessStoreService.updateStore(
      session.user.id, 
      id, 
      {
        name: validatedData.name,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        isActive: validatedData.isActive
      }
    );

    if (!updatedStore) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    return NextResponse.json(updatedStore);

  } catch (error) {
    console.error('Error updating store:', error);
    
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

// PATCH - Partial update (for status toggle)
export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const updatedStore = await BusinessServices.BusinessStoreService.toggleStoreStatus(session.user.id, id);

    if (!updatedStore) {
      return NextResponse.json({ error: 'Tienda no encontrada' }, { status: 404 });
    }

    return NextResponse.json(updatedStore);

  } catch (error) {
    console.error('Error updating store status:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// DELETE - Delete store
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const success = await BusinessServices.BusinessStoreService.deleteStore(session.user.id, id);

    if (!success) {
      return NextResponse.json({ 
        error: 'No se pudo eliminar la tienda. Verifica que no tenga órdenes pendientes.' 
      }, { status: 400 });
    }

    return NextResponse.json({ message: 'Tienda eliminada exitosamente' });

  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}