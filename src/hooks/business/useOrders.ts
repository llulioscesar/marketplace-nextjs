import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Tipos
export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
    imageUrl: string | null;
  };
}

export interface OrderData {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
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

export interface OrdersFilters {
  searchQuery?: string;
  statusFilter?: string;
  storeFilter?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface OrdersResponse {
  orders: OrderData[];
  totalCount: number;
}

// API functions
const fetchOrders = async (filters: OrdersFilters): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  
  if (filters.searchQuery) params.append('search', filters.searchQuery);
  if (filters.statusFilter) params.append('status', filters.statusFilter);
  if (filters.storeFilter) params.append('storeId', filters.storeFilter);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await fetch(`/api/business/orders?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar las órdenes');
  }
  
  return response.json();
};

const updateOrderStatus = async ({ orderId, status, action }: { 
  orderId: string; 
  status?: string;
  action?: 'process' | 'complete' | 'cancel';
}) => {
  const body = action ? { action } : { status };
  
  const response = await fetch(`/api/business/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    throw new Error('Error al actualizar el estado de la orden');
  }
  
  return response.json();
};

const fetchOrder = async (orderId: string) => {
  const response = await fetch(`/api/business/orders/${orderId}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Orden no encontrada');
    }
    if (response.status === 403) {
      throw new Error('No tienes permisos para ver esta orden');
    }
    throw new Error('Error al cargar la orden');
  }
  
  return response.json();
};

// Hooks
export const useOrders = (filters: OrdersFilters) => {
  return useQuery({
    queryKey: ['business', 'orders', filters],
    queryFn: () => fetchOrders(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - más corto para órdenes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Importante para órdenes
    enabled: true,
  });
};

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['business', 'order', orderId],
    queryFn: () => fetchOrder(orderId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    enabled: !!orderId,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 403 errors
      if (error?.message?.includes('no encontrada') || error?.message?.includes('permisos')) {
        return false;
      }
      return failureCount < 3;
    }
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateOrderStatus,
    onMutate: async ({ orderId, status, action }) => {
      // Determine the new status based on action
      let newStatus = status;
      if (action) {
        switch (action) {
          case 'process':
            newStatus = 'PROCESSING';
            break;
          case 'complete':
            newStatus = 'COMPLETED';
            break;
          case 'cancel':
            newStatus = 'CANCELLED';
            break;
        }
      }

      // Optimistic update for orders list
      await queryClient.cancelQueries({ queryKey: ['business', 'orders'] });
      await queryClient.cancelQueries({ queryKey: ['business', 'order', orderId] });
      
      const previousOrdersData = queryClient.getQueriesData({ 
        queryKey: ['business', 'orders'] 
      });

      const previousOrderData = queryClient.getQueryData(['business', 'order', orderId]);
      
      // Update orders list
      queryClient.setQueriesData<OrdersResponse>(
        { queryKey: ['business', 'orders'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            orders: old.orders.map(order =>
              order.id === orderId ? { ...order, status: newStatus || order.status } : order
            )
          };
        }
      );

      // Update individual order query
      queryClient.setQueryData(['business', 'order', orderId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          status: newStatus || old.status
        };
      });
      
      return { previousOrdersData, previousOrderData };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousOrdersData) {
        context.previousOrdersData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      if (context?.previousOrderData) {
        queryClient.setQueryData(['business', 'order', variables.orderId], context.previousOrderData);
      }
      
      toast.error('Error al actualizar el estado de la orden');
    },
    onSuccess: (data, { status, action }) => {
      const actionLabels: Record<string, string> = {
        'process': 'procesando',
        'complete': 'completada',
        'cancel': 'cancelada'
      };

      const statusLabels: Record<string, string> = {
        'PROCESSING': 'procesando',
        'COMPLETED': 'completada',
        'CANCELLED': 'cancelada'
      };
      
      const label = action ? actionLabels[action] : statusLabels[status || ''];
      toast.success(`Orden marcada como ${label || 'actualizada'}`);
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['business', 'orders'],
        refetchType: 'none' // Don't refetch immediately since we have optimistic update
      });
      
      // Also invalidate the individual order query
      queryClient.invalidateQueries({ 
        queryKey: ['business', 'order'],
        refetchType: 'none'
      });
    },
    onSettled: () => {
      // Always refetch after 2 seconds to ensure consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['business', 'orders'] });
        queryClient.invalidateQueries({ queryKey: ['business', 'order'] });
      }, 2000);
    },
  });
};