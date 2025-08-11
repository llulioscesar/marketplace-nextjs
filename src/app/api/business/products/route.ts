import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth/server';
import { BusinessServices } from '@/services';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'El nombre es muy largo'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor a 0'),
  stock: z.number().int().min(0, 'El stock debe ser mayor o igual a 0'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  storeId: z.string().min(1, 'La tienda es requerida'),
  isActive: z.boolean().optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || undefined;
    const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined;
    const hasStock = searchParams.get('hasStock') ? searchParams.get('hasStock') === 'true' : undefined;
    const search = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [products, totalCount] = await Promise.all([
      BusinessServices.BusinessProductService.getBusinessProducts(
        session.user.id,
        { storeId, isActive, hasStock, search, minPrice, maxPrice, limit, offset }
      ),
      BusinessServices.BusinessProductService.getBusinessProductsCount(
        session.user.id,
        { storeId, isActive, hasStock, search, minPrice, maxPrice }
      )
    ]);

    return NextResponse.json({ products, totalCount });

  } catch (error) {
    console.error('Error fetching business products:', error);
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
    const validatedData = createProductSchema.parse(body);

    const product = await BusinessServices.BusinessProductService.createProduct(
      session.user.id,
      {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        stock: validatedData.stock,
        imageUrl: validatedData.imageUrl,
        storeId: validatedData.storeId,
        isActive: validatedData.isActive
      }
    );

    if (!product) {
      return NextResponse.json({ 
        error: 'Error al crear el producto. Verifica que la tienda pertenezca a tu negocio.' 
      }, { status: 400 });
    }

    return NextResponse.json(product, { status: 201 });

  } catch (error) {
    console.error('Error creating business product:', error);
    
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