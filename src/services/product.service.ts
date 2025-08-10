import { prisma } from '@/lib/db';
import { Product } from '@prisma/client';
import { 
  ProductWithStore, 
  ProductFilters, 
  ProductCreateData, 
  ProductUpdateData 
} from '@/types/product.types';

export class ProductService {
  /**
   * Obtiene productos con filtros opcionales
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
   * Obtiene productos activos de una tienda
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
   * Obtiene un producto por ID
   */
  static async getProductById(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({
      where: { id },
    });
  }

  /**
   * Obtiene un producto por ID con información de la tienda
   */
  static async getProductWithStore(id: string): Promise<ProductWithStore | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
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
   * Crea un nuevo producto
   */
  static async createProduct(data: ProductCreateData): Promise<Product> {
    return await prisma.product.create({
      data,
    });
  }

  /**
   * Actualiza un producto
   */
  static async updateProduct(id: string, data: ProductUpdateData): Promise<Product | null> {
    try {
      return await prisma.product.update({
        where: { id },
        data,
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Elimina un producto (soft delete)
   */
  static async deleteProduct(id: string): Promise<boolean> {
    try {
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica si un producto existe y está activo
   */
  static async productExists(id: string): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      select: { id: true },
    });

    return !!product;
  }

  /**
   * Actualiza el stock de un producto
   */
  static async updateStock(id: string, quantity: number): Promise<Product | null> {
    try {
      return await prisma.product.update({
        where: { id },
        data: {
          stock: {
            increment: quantity, // Puede ser negativo para decrementar
          },
        },
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene el conteo total de productos activos de una tienda
   */
  static async getActiveProductCountByStore(storeId: string): Promise<number> {
    return await prisma.product.count({
      where: {
        storeId,
        isActive: true,
      },
    });
  }
}