import { prisma } from '@/lib/db';
import { Product } from '@prisma/client';
import { 
  ProductWithStore, 
  ProductFilters, 
  ProductCreateData, 
  ProductUpdateData 
} from '@/types/product.types';

/**
 * Customer Product Service - For public product browsing and customer-facing operations
 */
export class CustomerProductService {
  /**
   * Obtiene productos con filtros opcionales (vista pública)
   */
  static async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const {
      storeId,
      isActive = true,
      hasStock = true,
      minPrice,
      maxPrice,
      search
    } = filters;

    const where: any = {};

    if (storeId) where.storeId = storeId;
    if (isActive !== undefined) where.isActive = isActive;
    if (hasStock) where.stock = { gt: 0 };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    return await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Obtiene productos activos de una tienda (vista pública)
   */
  static async getActiveProductsByStore(storeId: string): Promise<Product[]> {
    return await prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
        stock: {
          gt: 0,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        storeId: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Obtiene un producto por ID (vista pública)
   */
  static async getProductById(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { 
        id,
        isActive: true // Solo productos activos para customers
      },
    });
  }

  /**
   * Obtiene un producto por ID con información de la tienda (vista pública)
   */
  static async getProductWithStore(id: string): Promise<ProductWithStore | null> {
    const product = await prisma.product.findUnique({
      where: { 
        id,
        isActive: true
      },
      include: {
        store: {
          where: {
            isActive: true // Solo de tiendas activas
          },
          include: {
            business: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return product as ProductWithStore | null;
  }

  /**
   * Verifica si un producto existe y está disponible para compra
   */
  static async isProductAvailable(id: string): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { 
        id, 
        isActive: true,
        stock: { gt: 0 }
      },
      include: {
        store: {
          select: {
            isActive: true
          }
        }
      }
    });

    return !!(product && product.store.isActive);
  }

  /**
   * Obtiene productos relacionados/similares (por tienda o categoría)
   */
  static async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const product = await this.getProductById(productId);
    
    if (!product) {
      return [];
    }

    return await prisma.product.findMany({
      where: {
        storeId: product.storeId,
        isActive: true,
        stock: { gt: 0 },
        id: { not: productId }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Búsqueda de productos con texto completo
   */
  static async searchProducts(
    query: string, 
    filters: Omit<ProductFilters, 'search'> = {},
    limit: number = 20
  ): Promise<Product[]> {
    return this.getProducts({
      ...filters,
      search: query
    });
  }

  /**
   * Obtiene productos por rango de precios
   */
  static async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number,
    storeId?: string
  ): Promise<Product[]> {
    return this.getProducts({
      minPrice,
      maxPrice,
      storeId,
      isActive: true,
      hasStock: true
    });
  }

  /**
   * Obtiene productos más vendidos (mock - requiere implementar analytics)
   */
  static async getBestSellingProducts(limit: number = 10): Promise<Product[]> {
    // Por ahora, devolver productos ordenados por fecha (mock)
    // En el futuro, implementar basado en analytics reales
    return await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        store: {
          isActive: true
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Obtiene productos recién añadidos
   */
  static async getNewestProducts(limit: number = 10): Promise<Product[]> {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        store: {
          isActive: true
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Verifica disponibilidad de stock para múltiples productos
   */
  static async checkStockAvailability(items: { productId: string; quantity: number }[]): Promise<{
    available: boolean;
    unavailableItems: string[];
  }> {
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      },
      select: {
        id: true,
        stock: true,
        store: {
          select: {
            isActive: true
          }
        }
      }
    });

    const unavailableItems: string[] = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product || !product.store.isActive || product.stock < item.quantity) {
        unavailableItems.push(item.productId);
      }
    }

    return {
      available: unavailableItems.length === 0,
      unavailableItems
    };
  }
}