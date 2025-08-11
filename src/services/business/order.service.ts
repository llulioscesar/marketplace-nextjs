import { prisma } from '@/lib/db';
import { Order } from '@prisma/client';

export interface BusinessOrderWithDetails extends Order {
  items: {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: {
      name: string;
      imageUrl: string | null;
    };
  }[];
  customer: {
    id: string;
    name: string | null;
    email: string | null;
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface BusinessOrderFilters {
  storeId?: string;
  status?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface BusinessOrderStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, { count: number; totalAmount: number }>;
  ordersByStore: Record<string, { count: number; totalAmount: number; storeName: string }>;
  recentOrders: BusinessOrderWithDetails[];
}

export class BusinessOrderService {
  /**
   * Obtiene todas las órdenes de las tiendas del business
   */
  static async getBusinessOrders(businessId: string, filters: BusinessOrderFilters = {}): Promise<BusinessOrderWithDetails[]> {
    const { storeId, status, search, startDate, endDate, limit = 20, offset = 0 } = filters;

    const where: any = {
      store: {
        businessId
      }
    };

    if (storeId) {
      where.storeId = storeId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return orders as BusinessOrderWithDetails[];
  }

  /**
   * Obtiene el conteo total de órdenes con filtros
   */
  static async getBusinessOrdersCount(businessId: string, filters: Omit<BusinessOrderFilters, 'limit' | 'offset'> = {}): Promise<number> {
    const { storeId, status, search, startDate, endDate } = filters;

    const where: any = {
      store: {
        businessId
      }
    };

    if (storeId) {
      where.storeId = storeId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const count = await prisma.order.count({ where });
    return count;
  }

  /**
   * Obtiene una orden específica del business
   */
  static async getBusinessOrder(businessId: string, orderId: string): Promise<BusinessOrderWithDetails | null> {
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        store: {
          businessId
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return order as BusinessOrderWithDetails | null;
  }

  /**
   * Obtiene órdenes por tienda específica
   */
  static async getStoreOrders(businessId: string, storeId: string, filters: Omit<BusinessOrderFilters, 'storeId'> = {}): Promise<BusinessOrderWithDetails[]> {
    // Verificar que la tienda pertenezca al business
    const store = await prisma.store.findFirst({
      where: { id: storeId, businessId },
      select: { id: true }
    });

    if (!store) {
      return [];
    }

    return this.getBusinessOrders(businessId, { ...filters, storeId });
  }

  /**
   * Actualiza el estado de una orden
   */
  static async updateOrderStatus(businessId: string, orderId: string, status: string): Promise<boolean> {
    try {
      // Verificar que la orden pertenezca al business
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          store: {
            businessId
          }
        },
        select: { id: true }
      });

      if (!order) {
        return false;
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas de órdenes del business
   */
  static async getBusinessOrderStats(businessId: string, filters: { startDate?: Date; endDate?: Date } = {}): Promise<BusinessOrderStats> {
    const { startDate, endDate } = filters;

    const where: any = {
      store: {
        businessId
      }
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Obtener estadísticas generales
    const [orderStats, storeStats, recentOrders] = await Promise.all([
      // Estadísticas por status
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),

      // Estadísticas por tienda
      prisma.order.groupBy({
        by: ['storeId'],
        where,
        _count: { _all: true },
        _sum: { totalAmount: true },
      }),

      // Órdenes recientes
      this.getBusinessOrders(businessId, { limit: 5 })
    ]);

    // Obtener nombres de tiendas
    const storeIds = storeStats.map(stat => stat.storeId);
    const stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true }
    });

    const totalOrders = orderStats.reduce((sum, stat) => sum + stat._count._all, 0);
    const totalRevenue = orderStats.reduce((sum, stat) => sum + (stat._sum.totalAmount || 0), 0);

    const ordersByStatus = orderStats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count._all,
        totalAmount: stat._sum.totalAmount || 0,
      };
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number }>);

    const ordersByStore = storeStats.reduce((acc, stat) => {
      const store = stores.find(s => s.id === stat.storeId);
      acc[stat.storeId] = {
        count: stat._count._all,
        totalAmount: stat._sum.totalAmount || 0,
        storeName: store?.name || 'Tienda desconocida',
      };
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number; storeName: string }>);

    return {
      totalOrders,
      totalRevenue,
      ordersByStatus,
      ordersByStore,
      recentOrders,
    };
  }

  /**
   * Obtiene resumen de ventas por período
   */
  static async getSalesReport(businessId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const orders = await prisma.order.findMany({
      where: {
        store: {
          businessId
        },
        createdAt: {
          gte: startDate
        },
        status: { not: 'CANCELLED' }
      },
      select: {
        totalAmount: true,
        createdAt: true,
        status: true,
      }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedOrders = orders.filter(order => order.status === 'COMPLETED');
    const completedSales = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      period,
      startDate,
      endDate: now,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      totalSales,
      completedSales,
      averageOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
    };
  }

  /**
   * Marca una orden como procesada
   */
  static async markAsProcessed(businessId: string, orderId: string): Promise<boolean> {
    return this.updateOrderStatus(businessId, orderId, 'PROCESSING');
  }

  /**
   * Marca una orden como completada
   */
  static async markAsCompleted(businessId: string, orderId: string): Promise<boolean> {
    return this.updateOrderStatus(businessId, orderId, 'COMPLETED');
  }

  /**
   * Cancela una orden
   */
  static async cancelOrder(businessId: string, orderId: string): Promise<boolean> {
    try {
      // Verificar que la orden pueda ser cancelada
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          store: {
            businessId
          },
          status: { in: ['PENDING', 'PROCESSING'] }
        },
        include: {
          items: true
        }
      });

      if (!order) {
        return false;
      }

      // Usar transacción para restaurar stock y cancelar orden
      await prisma.$transaction(async (tx) => {
        // Restaurar stock de productos
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }

        // Cancelar la orden
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' }
        });
      });

      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    }
  }
}