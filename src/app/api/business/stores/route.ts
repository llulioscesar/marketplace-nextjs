import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { BusinessServices } from '@/services';
import { z } from 'zod';

const createStoreSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});


export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [stores, totalCount] = await Promise.all([
      BusinessServices.BusinessStoreService.getBusinessStoresWithFilters(
        session.user.id,
        { search, isActive, limit, offset }
      ),
      BusinessServices.BusinessStoreService.getBusinessStoresCount(
        session.user.id,
        { search, isActive }
      )
    ]);

    return NextResponse.json({ stores, totalCount });

  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
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