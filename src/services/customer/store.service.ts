import { prisma } from '@/lib/db';
import { CustomerProductService } from './product.service';
import { calculatePagination, calculateOffset } from '@/lib/utils/pagination.utils';
import { 
  StoreWithProductCount, 
  StoreWithProducts, 
  PaginationParams, 
  PaginatedStoresResponse,
  PaginationInfo 
} from '@/types/store.types';

/**
 * Customer Store Service - For public store browsing and customer-facing operations
 */
export class CustomerStoreService {
  /**
   * Obtiene todas las tiendas activas con paginación (vista pública)
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
   * Obtiene una tienda por slug con sus productos activos (vista pública)
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

    // Obtener los productos usando CustomerProductService
    const products = await CustomerProductService.getActiveProductsByStore(store.id);

    return {
      ...store,
      products,
    } as StoreWithProducts;
  }

  /**
   * Obtiene una tienda por ID (vista pública)
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

    // Obtener solo productos activos y con stock para customers
    const products = await CustomerProductService.getProducts({ 
      storeId: store.id, 
      isActive: true,
      hasStock: true
    });

    return {
      ...store,
      products,
    } as StoreWithProducts;
  }

  /**
   * Verifica si una tienda existe y está activa (vista pública)
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
   * Obtiene el conteo total de tiendas activas (vista pública)
   */
  static async getTotalActiveStores(): Promise<number> {
    return await prisma.store.count({
      where: {
        isActive: true,
      },
    });
  }

  /**
   * Búsqueda de tiendas por nombre o descripción
   */
  static async searchStores(
    query: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedStoresResponse> {
    const { page, limit } = params;
    const skip = calculateOffset(page, limit);

    const where = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };

    const [stores, totalStores] = await Promise.all([
      prisma.store.findMany({
        where,
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
      }) as Promise<StoreWithProductCount[]>,
      
      prisma.store.count({ where })
    ]);

    const pagination = calculatePagination(totalStores, params);

    return {
      stores,
      pagination,
    };
  }

  /**
   * Obtiene tiendas destacadas (con más productos activos)
   */
  static async getFeaturedStores(limit: number = 8): Promise<StoreWithProductCount[]> {
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
                stock: { gt: 0 }
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
        products: {
          _count: 'desc'
        }
      },
      take: limit,
    }) as StoreWithProductCount[];

    return stores;
  }

  /**
   * Obtiene tiendas nuevas/recientes
   */
  static async getNewestStores(limit: number = 6): Promise<StoreWithProductCount[]> {
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
                stock: { gt: 0 }
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
        createdAt: 'desc'
      },
      take: limit,
    }) as StoreWithProductCount[];

    return stores;
  }

  /**
   * Obtiene categorías de productos por tienda (mock - para futuras implementaciones)
   */
  static async getStoreCategories(storeId: string): Promise<string[]> {
    // Por ahora, devolver categorías mock
    // En el futuro, implementar basado en categorías reales de productos
    const products = await prisma.product.findMany({
      where: {
        storeId,
        isActive: true
      },
      select: {
        description: true
      },
      distinct: ['description']
    });

    // Mock: extraer "categorías" de las primeras palabras de descripción
    return products
      .filter(p => p.description)
      .map(p => p.description!.split(' ')[0])
      .filter((category, index, self) => self.indexOf(category) === index)
      .slice(0, 10);
  }

  /**
   * Verifica si multiple tiendas están activas
   */
  static async areStoresActive(storeIds: string[]): Promise<{
    activeStores: string[];
    inactiveStores: string[];
  }> {
    const stores = await prisma.store.findMany({
      where: {
        id: { in: storeIds }
      },
      select: {
        id: true,
        isActive: true
      }
    });

    const activeStores = stores.filter(store => store.isActive).map(store => store.id);
    const inactiveStores = storeIds.filter(id => !activeStores.includes(id));

    return {
      activeStores,
      inactiveStores
    };
  }
}