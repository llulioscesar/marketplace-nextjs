import { prisma } from '@/lib/db';
import { ProductService } from './product.service';
import { calculatePagination, calculateOffset } from '@/lib/utils/pagination.utils';
import { 
  StoreWithProductCount, 
  StoreWithProducts, 
  PaginationParams, 
  PaginatedStoresResponse,
  PaginationInfo 
} from '@/types/store.types';

export class StoreService {
  /**
   * Obtiene todas las tiendas activas con paginación
   */
  static async getAllStores(params: PaginationParams): Promise<PaginatedStoresResponse> {
    const { page, limit } = params;
    const skip = calculateOffset(page, limit);

    // Obtener el total de tiendas para calcular la paginación
    const totalStores = await prisma.store.count({
      where: {
        isActive: true,
      },
    });

    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        businessId: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
        business: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }) as StoreWithProductCount[];

    const pagination = calculatePagination(totalStores, params);

    return {
      stores,
      pagination,
    };
  }

  /**
   * Obtiene una tienda por slug con sus productos
   */
  static async getStoreBySlugWithProducts(slug: string): Promise<StoreWithProducts | null> {
    // Obtener la tienda básica
    const store = await prisma.store.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        business: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!store) {
      return null;
    }

    // Obtener los productos usando ProductService
    const products = await ProductService.getActiveProductsByStore(store.id);

    return {
      ...store,
      products,
    } as StoreWithProducts;
  }

  /**
   * Obtiene una tienda por ID
   */
  static async getStoreById(id: string): Promise<StoreWithProducts | null> {
    // Obtener la tienda básica
    const store = await prisma.store.findUnique({
      where: {
        id,
        isActive: true,
      },
      include: {
        business: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!store) {
      return null;
    }

    // Obtener todos los productos (no solo los que tienen stock)
    const products = await ProductService.getProducts({ 
      storeId: store.id, 
      hasStock: false 
    });

    return {
      ...store,
      products,
    } as StoreWithProducts;
  }

  /**
   * Verifica si una tienda existe y está activa
   */
  static async storeExists(slug: string): Promise<boolean> {
    const store = await prisma.store.findUnique({
      where: {
        slug,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    return !!store;
  }

  /**
   * Obtiene el conteo total de tiendas activas
   */
  static async getTotalActiveStores(): Promise<number> {
    return await prisma.store.count({
      where: {
        isActive: true,
      },
    });
  }
}