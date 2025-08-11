import { prisma } from '@/lib/db';
import { Store } from '@prisma/client';

export interface BusinessStoreCreateData {
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface BusinessStoreUpdateData {
  name?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface BusinessStoreWithStats extends Store {
  _count: {
    products: number;
    orders: number;
  };
}

export interface BusinessStoreFilters {
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface BusinessStoreStats {
  totalStores: number;
  activeStores: number;
  inactiveStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export class BusinessStoreService {
  /**
   * Obtiene todas las tiendas de un business
   */
  static async getBusinessStores(businessId: string): Promise<BusinessStoreWithStats[]> {
    const stores = await prisma.store.findMany({
      where: { businessId },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            },
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return stores as BusinessStoreWithStats[];
  }

  /**
   * Obtiene las tiendas de un business con filtros y paginación
   */
  static async getBusinessStoresWithFilters(businessId: string, filters: BusinessStoreFilters = {}): Promise<BusinessStoreWithStats[]> {
    const { search, isActive, limit = 20, offset = 0 } = filters;

    const where: any = { businessId };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true }
            },
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return stores as BusinessStoreWithStats[];
  }

  /**
   * Obtiene el conteo total de tiendas con filtros
   */
  static async getBusinessStoresCount(businessId: string, filters: Omit<BusinessStoreFilters, 'limit' | 'offset'> = {}): Promise<number> {
    const { search, isActive } = filters;

    const where: any = { businessId };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    return await prisma.store.count({ where });
  }

  /**
   * Obtiene una tienda específica del business
   */
  static async getBusinessStore(businessId: string, storeId: string): Promise<Store | null> {
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        businessId
      }
    });

    return store;
  }

  /**
   * Obtiene una tienda por slug (verificando ownership)
   */
  static async getBusinessStoreBySlug(businessId: string, slug: string): Promise<Store | null> {
    const store = await prisma.store.findFirst({
      where: {
        slug,
        businessId
      }
    });

    return store;
  }

  /**
   * Crea una nueva tienda
   */
  static async createStore(businessId: string, data: BusinessStoreCreateData): Promise<Store | null> {
    try {
      // Generar slug único basado en el nombre
      const baseSlug = this.generateSlug(data.name);
      const slug = await this.generateUniqueSlug(baseSlug);

      const store = await prisma.store.create({
        data: {
          ...data,
          slug,
          businessId,
          isActive: data.isActive !== undefined ? data.isActive : true,
        }
      });

      return store;
    } catch (error) {
      console.error('Error creating store:', error);
      return null;
    }
  }

  /**
   * Actualiza una tienda
   */
  static async updateStore(businessId: string, storeId: string, data: BusinessStoreUpdateData): Promise<Store | null> {
    try {
      // Verificar que la tienda pertenezca al business
      const existingStore = await this.getBusinessStore(businessId, storeId);
      
      if (!existingStore) {
        return null;
      }

      // Si se está actualizando el nombre, regenerar slug
      let updateData: any = { ...data };
      if (data.name && data.name !== existingStore.name) {
        const baseSlug = this.generateSlug(data.name);
        const newSlug = await this.generateUniqueSlug(baseSlug, storeId);
        updateData.slug = newSlug;
      }

      const store = await prisma.store.update({
        where: { id: storeId },
        data: updateData
      });

      return store;
    } catch (error) {
      console.error('Error updating store:', error);
      return null;
    }
  }

  /**
   * Elimina una tienda (soft delete)
   */
  static async deleteStore(businessId: string, storeId: string): Promise<boolean> {
    try {
      // Verificar que la tienda pertenezca al business
      const existingStore = await this.getBusinessStore(businessId, storeId);
      
      if (!existingStore) {
        return false;
      }

      // Verificar que no tenga órdenes pendientes
      const pendingOrders = await prisma.order.count({
        where: {
          storeId,
          status: { in: ['PENDING', 'PROCESSING'] }
        }
      });

      if (pendingOrders > 0) {
        throw new Error('No se puede eliminar una tienda con órdenes pendientes');
      }

      // Soft delete de la tienda y sus productos
      await prisma.$transaction([
        prisma.product.updateMany({
          where: { storeId },
          data: { isActive: false }
        }),
        prisma.store.update({
          where: { id: storeId },
          data: { isActive: false }
        })
      ]);

      return true;
    } catch (error) {
      console.error('Error deleting store:', error);
      return false;
    }
  }

  /**
   * Activa o desactiva una tienda
   */
  static async toggleStoreStatus(businessId: string, storeId: string): Promise<Store | null> {
    try {
      const existingStore = await this.getBusinessStore(businessId, storeId);
      
      if (!existingStore) {
        return null;
      }

      const store = await prisma.store.update({
        where: { id: storeId },
        data: {
          isActive: !existingStore.isActive
        }
      });

      // Si se desactiva la tienda, desactivar también sus productos
      if (!store.isActive) {
        await prisma.product.updateMany({
          where: { storeId },
          data: { isActive: false }
        });
      }

      return store;
    } catch (error) {
      console.error('Error toggling store status:', error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas de las tiendas del business
   */
  static async getBusinessStoreStats(businessId: string): Promise<BusinessStoreStats> {
    const [stores, orders] = await Promise.all([
      prisma.store.findMany({
        where: { businessId },
        include: {
          _count: {
            select: {
              products: { where: { isActive: true } },
              orders: true
            }
          }
        }
      }),
      prisma.order.findMany({
        where: {
          store: { businessId },
          status: { not: 'CANCELLED' }
        },
        select: { totalAmount: true }
      })
    ]);

    const totalStores = stores.length;
    const activeStores = stores.filter(store => store.isActive).length;
    const inactiveStores = totalStores - activeStores;
    const totalProducts = stores.reduce((sum, store) => sum + store._count.products, 0);
    const totalOrders = stores.reduce((sum, store) => sum + store._count.orders, 0);
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      totalStores,
      activeStores,
      inactiveStores,
      totalProducts,
      totalOrders,
      totalRevenue
    };
  }

  /**
   * Obtiene las tiendas más activas
   */
  static async getTopPerformingStores(businessId: string, limit: number = 5) {
    const stores = await prisma.store.findMany({
      where: { businessId, isActive: true },
      include: {
        _count: {
          select: {
            orders: {
              where: { status: 'COMPLETED' }
            }
          }
        },
        orders: {
          where: { status: 'COMPLETED' },
          select: { totalAmount: true }
        }
      },
      take: limit
    });

    return stores.map(store => ({
      id: store.id,
      name: store.name,
      slug: store.slug,
      completedOrders: store._count.orders,
      totalRevenue: store.orders.reduce((sum, order) => sum + order.totalAmount, 0)
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * Verifica si un slug está disponible
   */
  static async isSlugAvailable(slug: string, excludeStoreId?: string): Promise<boolean> {
    const where: any = { slug };
    if (excludeStoreId) {
      where.id = { not: excludeStoreId };
    }

    const existingStore = await prisma.store.findFirst({
      where,
      select: { id: true }
    });

    return !existingStore;
  }

  /**
   * Genera un slug basado en el nombre
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
      .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones por un solo guión
      .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
  }

  /**
   * Genera un slug único
   */
  private static async generateUniqueSlug(baseSlug: string, excludeStoreId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (!(await this.isSlugAvailable(slug, excludeStoreId))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}