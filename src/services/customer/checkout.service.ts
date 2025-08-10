import { prisma } from '@/lib/db';
import { CustomerOrderService, CustomerOrderData } from './order.service';

export interface CheckoutItem {
  productId: string;
  quantity: number;
  storeId: string;
}

export interface CheckoutData {
  items: CheckoutItem[];
  customerId: string;
  shippingAddress?: string;
  notes?: string;
}

export interface CheckoutValidation {
  isValid: boolean;
  errors: string[];
  validatedItems: {
    productId: string;
    quantity: number;
    price: number;
    storeId: string;
    availableStock: number;
  }[];
}

export interface CheckoutResult {
  success: boolean;
  orderIds?: string[];
  errors?: string[];
}

export class CustomerCheckoutService {
  /**
   * Valida los items del checkout antes de procesar
   */
  static async validateCheckout(items: CheckoutItem[]): Promise<CheckoutValidation> {
    const errors: string[] = [];
    const validatedItems: CheckoutValidation['validatedItems'] = [];

    if (!items || items.length === 0) {
      return {
        isValid: false,
        errors: ['No hay items en el carrito'],
        validatedItems: []
      };
    }

    // Obtener todos los productos en una consulta
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      },
      include: {
        store: {
          select: {
            id: true,
            isActive: true
          }
        }
      }
    });

    // Validar cada item
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);

      if (!product) {
        errors.push(`Producto ${item.productId} no encontrado o no disponible`);
        continue;
      }

      if (!product.store.isActive) {
        errors.push(`La tienda del producto "${product.name}" no está activa`);
        continue;
      }

      if (product.storeId !== item.storeId) {
        errors.push(`Inconsistencia de tienda para el producto "${product.name}"`);
        continue;
      }

      if (item.quantity <= 0) {
        errors.push(`Cantidad inválida para el producto "${product.name}"`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
        continue;
      }

      validatedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        storeId: product.storeId,
        availableStock: product.stock
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      validatedItems
    };
  }

  /**
   * Procesa el checkout completo
   */
  static async processCheckout(checkoutData: CheckoutData): Promise<CheckoutResult> {
    const { items, customerId, shippingAddress, notes } = checkoutData;

    try {
      // Validar items
      const validation = await this.validateCheckout(items);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      // Usar transacción para asegurar consistencia
      const result = await prisma.$transaction(async (tx) => {
        // Verificar stock nuevamente dentro de la transacción
        const finalValidation = await this.revalidateStockInTransaction(tx, validation.validatedItems);
        
        if (!finalValidation.isValid) {
          throw new Error(`Stock insuficiente: ${finalValidation.errors.join(', ')}`);
        }

        // Actualizar stock de productos
        for (const item of validation.validatedItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }

        // Crear órdenes usando el servicio de órdenes
        const orderData: CustomerOrderData = {
          items: validation.validatedItems,
          customerId,
          shippingAddress,
          notes
        };

        // Crear órdenes fuera de la transacción principal usando prisma directo
        const itemsByStore = validation.validatedItems.reduce((groups: Record<string, typeof validation.validatedItems>, item) => {
          if (!groups[item.storeId]) {
            groups[item.storeId] = [];
          }
          groups[item.storeId].push(item);
          return groups;
        }, {});

        const createdOrders = [];
        
        for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
          const totalAmount = storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
          const order = await tx.order.create({
            data: {
              orderNumber: await this.generateOrderNumber(tx),
              customerId,
              storeId,
              totalAmount,
              status: 'PENDING',
              shippingAddress,
              notes,
              orderItems: {
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
      });

      return {
        success: true,
        orderIds: result.map(order => order.id)
      };

    } catch (error) {
      console.error('Error processing checkout:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Error desconocido durante el checkout']
      };
    }
  }

  /**
   * Calcula el resumen del checkout
   */
  static async calculateCheckoutSummary(items: CheckoutItem[]) {
    const validation = await this.validateCheckout(items);
    
    if (!validation.isValid) {
      return {
        isValid: false,
        errors: validation.errors,
        summary: null
      };
    }

    const itemsByStore = validation.validatedItems.reduce((groups: Record<string, typeof validation.validatedItems>, item) => {
      if (!groups[item.storeId]) {
        groups[item.storeId] = [];
      }
      groups[item.storeId].push(item);
      return groups;
    }, {});

    const storeIds = Object.keys(itemsByStore);
    const stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true }
    });

    const summary = {
      totalItems: validation.validatedItems.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount: validation.validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      storeBreakdown: Object.entries(itemsByStore).map(([storeId, storeItems]) => {
        const store = stores.find(s => s.id === storeId);
        return {
          storeId,
          storeName: store?.name || 'Tienda desconocida',
          itemCount: storeItems.length,
          totalQuantity: storeItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: storeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          items: storeItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
          }))
        };
      })
    };

    return {
      isValid: true,
      errors: [],
      summary
    };
  }

  /**
   * Revalida el stock dentro de una transacción
   */
  private static async revalidateStockInTransaction(tx: any, items: CheckoutValidation['validatedItems']) {
    const errors: string[] = [];
    const productIds = items.map(item => item.productId);
    
    const currentProducts = await tx.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true, name: true }
    });

    for (const item of items) {
      const product = currentProducts.find(p => p.id === item.productId);
      
      if (!product) {
        errors.push(`Producto no encontrado: ${item.productId}`);
        continue;
      }

      if (product.stock < item.quantity) {
        errors.push(`Stock insuficiente para "${product.name}". Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Genera un número único de orden dentro de una transacción
   */
  private static async generateOrderNumber(tx: any): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayOrdersCount = await tx.order.count({
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