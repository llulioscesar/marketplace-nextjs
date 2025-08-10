import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { BusinessServices } from '@/services';
import { z } from 'zod';

const createStoreSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const stores = await BusinessServices.BusinessStoreService.getBusinessStores(session.user.id);

    return NextResponse.json({ stores });

  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createStoreSchema.parse(body);

    const store = await BusinessServices.BusinessStoreService.createStore(session.user.id, {
      name: validatedData.name,
      description: validatedData.description,
      imageUrl: validatedData.imageUrl || undefined
    });

    if (!store) {
      return NextResponse.json({ 
        error: 'Error al crear la tienda' 
      }, { status: 500 });
    }

    return NextResponse.json(store, { status: 201 });

  } catch (error) {
    console.error('Error creating store:', error);
    
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