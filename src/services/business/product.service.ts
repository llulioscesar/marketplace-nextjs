import { prisma } from '@/lib/db';
import { Product } from '@prisma/client';

export interface BusinessProductCreateData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive?: boolean;
  storeId: string;
}

export interface BusinessProductUpdateData {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface BusinessProductWithStore extends Product {
  store: {
    id: string;
    name: string;
    slug: string;
    businessId: string;
  };
}

export interface BusinessProductFilters {
  storeId?: string;
  isActive?: boolean;
  hasStock?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface BusinessProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalValue: number;
  productsByStore: Record<string, { count: number; value: number; storeName: string }>;
}

export class BusinessProductService {
  /**
   * Obtiene el conteo total de productos de las tiendas del business (sin paginación)
   */
  static async getBusinessProductsCount(businessId: string, filters: Omit<BusinessProductFilters, 'limit' | 'offset'> = {}): Promise<number> {
    const {
      storeId,
      isActive,
      hasStock,
      search,
      minPrice,
      maxPrice
    } = filters;

    const where: any = {
      store: {
        businessId
      }
    };

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

    return await prisma.product.count({ where });
  }

  /**
   * Obtiene todos los productos de las tiendas del business
   */
  static async getBusinessProducts(businessId: string, filters: BusinessProductFilters = {}): Promise<BusinessProductWithStore[]> {
    const { storeId, isActive, hasStock, search, minPrice, maxPrice, limit = 20, offset = 0 } = filters;

    const where: any = {
      store: {
        businessId
      }
    };

    if (storeId) {
      where.storeId = storeId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (hasStock) {
      where.stock = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            businessId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return products as BusinessProductWithStore[];
  }

  /**
   * Obtiene productos de una tienda específica
   */
  static async getStoreProducts(businessId: string, storeId: string, filters: Omit<BusinessProductFilters, 'storeId'> = {}): Promise<BusinessProductWithStore[]> {
    // Verificar que la tienda pertenezca al business
    const store = await prisma.store.findFirst({
      where: { id: storeId, businessId },
      select: { id: true }
    });

    if (!store) {
      return [];
    }

    return this.getBusinessProducts(businessId, { ...filters, storeId });
  }

  /**
   * Obtiene un producto específico del business
   */
  static async getBusinessProduct(businessId: string, productId: string): Promise<BusinessProductWithStore | null> {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        store: {
          businessId
        }
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            businessId: true,
          },
        },
      },
    });

    return product as BusinessProductWithStore | null;
  }

  /**
   * Crea un nuevo producto
   */
  static async createProduct(businessId: string, data: BusinessProductCreateData): Promise<BusinessProductWithStore | null> {
    try {
      // Verificar que la tienda pertenezca al business
      const store = await prisma.store.findFirst({
        where: { id: data.storeId, businessId },
        select: { id: true }
      });

      if (!store) {
        throw new Error('La tienda no pertenece al negocio');
      }

      const product = await prisma.product.create({
        data: {
          ...data,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              businessId: true,
            },
          },
        },
      });

      return product as BusinessProductWithStore;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  /**
   * Actualiza un producto
   */
  static async updateProduct(businessId: string, productId: string, data: BusinessProductUpdateData): Promise<BusinessProductWithStore | null> {
    try {
      // Verificar que el producto pertenezca al business
      const existingProduct = await this.getBusinessProduct(businessId, productId);
      
      if (!existingProduct) {
        return null;
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              businessId: true,
            },
          },
        },
      });

      return product as BusinessProductWithStore;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  /**
   * Elimina un producto (soft delete)
   */
  static async deleteProduct(businessId: string, productId: string): Promise<boolean> {
    try {
      // Verificar que el producto pertenezca al business
      const existingProduct = await this.getBusinessProduct(businessId, productId);
      
      if (!existingProduct) {
        return false;
      }

      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
      });

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  /**
   * Actualiza el stock de un producto
   */
  static async updateProductStock(businessId: string, productId: string, quantity: number): Promise<BusinessProductWithStore | null> {
    try {
      // Verificar que el producto pertenezca al business
      const existingProduct = await this.getBusinessProduct(businessId, productId);
      
      if (!existingProduct) {
        return null;
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            increment: quantity, // Puede ser negativo para decrementar
          },
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              businessId: true,
            },
          },
        },
      });

      return product as BusinessProductWithStore;
    } catch (error) {
      console.error('Error updating product stock:', error);
      return null;
    }
  }

  /**
   * Establece el stock absoluto de un producto
   */
  static async setProductStock(businessId: string, productId: string, stock: number): Promise<BusinessProductWithStore | null> {
    try {
      // Verificar que el producto pertenezca al business
      const existingProduct = await this.getBusinessProduct(businessId, productId);
      
      if (!existingProduct) {
        return null;
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data: { stock },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              businessId: true,
            },
          },
        },
      });

      return product as BusinessProductWithStore;
    } catch (error) {
      console.error('Error setting product stock:', error);
      return null;
    }
  }

  /**
   * Activa o desactiva un producto
   */
  static async toggleProductStatus(businessId: string, productId: string): Promise<BusinessProductWithStore | null> {
    try {
      // Verificar que el producto pertenezca al business
      const existingProduct = await this.getBusinessProduct(businessId, productId);
      
      if (!existingProduct) {
        return null;
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data: {
          isActive: !existingProduct.isActive,
        },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              businessId: true,
            },
          },
        },
      });

      return product as BusinessProductWithStore;
    } catch (error) {
      console.error('Error toggling product status:', error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas de productos del business
   */
  static async getBusinessProductStats(businessId: string): Promise<BusinessProductStats> {
    const [productStats, storeStats] = await Promise.all([
      // Estadísticas generales
      prisma.product.groupBy({
        by: ['isActive'],
        where: {
          store: {
            businessId
          }
        },
        _count: { _all: true },
        _sum: { 
          price: true,
          stock: true 
        },
      }),

      // Estadísticas por tienda
      prisma.product.groupBy({
        by: ['storeId'],
        where: {
          store: {
            businessId
          }
        },
        _count: { _all: true },
        _sum: { 
          price: true,
          stock: true 
        },
      }),
    ]);

    // Obtener nombres de tiendas
    const storeIds = storeStats.map(stat => stat.storeId);
    const stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true }
    });

    // Obtener productos con poco stock
    const [lowStockProducts, outOfStockProducts] = await Promise.all([
      prisma.product.count({
        where: {
          store: {
            businessId
          },
          stock: { gt: 0, lte: 5 }, // Consideramos poco stock <= 5
          isActive: true
        }
      }),
      prisma.product.count({
        where: {
          store: {
            businessId
          },
          stock: 0,
          isActive: true
        }
      })
    ]);

    const totalProducts = productStats.reduce((sum, stat) => sum + stat._count._all, 0);
    const activeProducts = productStats.find(stat => stat.isActive === true)?._count._all || 0;
    
    // Calcular valor total del inventario (precio * stock)
    const allProducts = await prisma.product.findMany({
      where: {
        store: { businessId },
        isActive: true
      },
      select: { price: true, stock: true }
    });

    const totalValue = allProducts.reduce((sum, product) => sum + (product.price * product.stock), 0);

    const productsByStore = storeStats.reduce((acc, stat) => {
      const store = stores.find(s => s.id === stat.storeId);
      acc[stat.storeId] = {
        count: stat._count._all,
        value: (stat._sum.price || 0) * (stat._sum.stock || 0),
        storeName: store?.name || 'Tienda desconocida',
      };
      return acc;
    }, {} as Record<string, { count: number; value: number; storeName: string }>);

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      productsByStore,
    };
  }

  /**
   * Obtiene productos con poco stock
   */
  static async getLowStockProducts(businessId: string, threshold: number = 5): Promise<BusinessProductWithStore[]> {
    const products = await prisma.product.findMany({
      where: {
        store: {
          businessId
        },
        stock: { gt: 0, lte: threshold },
        isActive: true
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            businessId: true,
          },
        },
      },
      orderBy: { stock: 'asc' },
    });

    return products as BusinessProductWithStore[];
  }

  /**
   * Obtiene productos sin stock
   */
  static async getOutOfStockProducts(businessId: string): Promise<BusinessProductWithStore[]> {
    const products = await prisma.product.findMany({
      where: {
        store: {
          businessId
        },
        stock: 0,
        isActive: true
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            businessId: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return products as BusinessProductWithStore[];
  }

  /**
   * Actualiza stock en lote para múltiples productos
   */
  static async bulkUpdateStock(businessId: string, updates: { productId: string; stock: number }[]): Promise<boolean> {
    try {
      // Verificar que todos los productos pertenezcan al business
      const productIds = updates.map(update => update.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          store: { businessId }
        },
        select: { id: true }
      });

      if (products.length !== updates.length) {
        return false; // Algunos productos no pertenecen al business
      }

      // Actualizar en transacción
      await prisma.$transaction(
        updates.map(update => 
          prisma.product.update({
            where: { id: update.productId },
            data: { stock: update.stock }
          })
        )
      );

      return true;
    } catch (error) {
      console.error('Error bulk updating stock:', error);
      return false;
    }
  }
}