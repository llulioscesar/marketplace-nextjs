import { prisma } from '@/lib/db';
import { Order } from '@prisma/client';

export interface CustomerOrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  storeId: string;
}

export interface CustomerOrderData {
  items: CustomerOrderItem[];
  customerId: string;
  shippingAddress?: string;
  notes?: string;
}

export interface CustomerOrderWithDetails extends Order {
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
  store: {
    id: string;
    name: string;
    slug: string;
  };
}

export class CustomerOrderService {
  /**
   * Obtiene todas las órdenes de un cliente
   */
  static async getCustomerOrders(customerId: string): Promise<CustomerOrderWithDetails[]> {
    const orders = await prisma.order.findMany({
      where: { customerId },
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
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders as CustomerOrderWithDetails[];
  }

  /**
   * Obtiene una orden específica de un cliente
   */
  static async getCustomerOrder(customerId: string, orderId: string): Promise<CustomerOrderWithDetails | null> {
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId, 
        customerId 
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
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return order as CustomerOrderWithDetails | null;
  }

  /**
   * Crea múltiples órdenes agrupadas por tienda
   */
  static async createOrders(orderData: CustomerOrderData): Promise<Order[]> {
    const { items, customerId, shippingAddress, notes } = orderData;

    // Agrupar items por tienda
    const itemsByStore = items.reduce((groups: Record<string, CustomerOrderItem[]>, item) => {
      if (!groups[item.storeId]) {
        groups[item.storeId] = [];
      }
      groups[item.storeId].push(item);
      return groups;
    }, {});

    const createdOrders: Order[] = [];

    // Crear una orden por cada tienda
    for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
      const totalAmount = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const order = await prisma.order.create({
        data: {
          orderNumber: await this.generateOrderNumber(),
          customerId,
          storeId,
          totalAmount,
          status: 'PENDING',
          shippingAddress,
          notes,
          items: {
            create: storeItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      createdOrders.push(order);
    }

    return createdOrders;
  }

  /**
   * Cancela una orden del cliente
   */
  static async cancelOrder(customerId: string, orderId: string): Promise<boolean> {
    try {
      const order = await prisma.order.findFirst({
        where: { 
          id: orderId, 
          customerId,
          status: { in: ['PENDING', 'PROCESSING'] }
        },
      });

      if (!order) {
        return false;
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    }
  }

  /**
   * Obtiene el historial de órdenes con filtros
   */
  static async getOrderHistory(
    customerId: string, 
    filters: { status?: string; limit?: number; offset?: number } = {}
  ): Promise<CustomerOrderWithDetails[]> {
    const { status, limit = 10, offset = 0 } = filters;
    
    const where: any = { customerId };
    if (status) {
      where.status = status;
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

    return orders as CustomerOrderWithDetails[];
  }

  /**
   * Obtiene estadísticas de órdenes del cliente
   */
  static async getCustomerOrderStats(customerId: string) {
    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: { customerId },
      _count: { _all: true },
      _sum: { totalAmount: true },
    });

    const totalOrders = stats.reduce((sum, stat) => sum + stat._count._all, 0);
    const totalSpent = stats.reduce((sum, stat) => sum + (stat._sum.totalAmount || 0), 0);

    return {
      totalOrders,
      totalSpent,
      ordersByStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = {
          count: stat._count._all,
          totalAmount: stat._sum.totalAmount || 0,
        };
        return acc;
      }, {} as Record<string, { count: number; totalAmount: number }>),
    };
  }

  /**
   * Genera un número único de orden
   */
  private static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Obtener el siguiente número secuencial del día
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrdersCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const sequence = (todayOrdersCount + 1).toString().padStart(4, '0');
    
    return `ORD-${year}${month}${day}-${sequence}`;
  }
}