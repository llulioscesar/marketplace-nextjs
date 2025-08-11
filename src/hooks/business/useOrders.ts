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

const updateOrderStatus = async ({ orderId, status }: { orderId: string; status: string }) => {
  const response = await fetch(`/api/business/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    throw new Error('Error al actualizar el estado de la orden');
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

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateOrderStatus,
    onMutate: async ({ orderId, status }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['business', 'orders'] });
      
      const previousData = queryClient.getQueriesData({ 
        queryKey: ['business', 'orders'] 
      });
      
      // Update all relevant queries
      queryClient.setQueriesData<OrdersResponse>(
        { queryKey: ['business', 'orders'] },
        (old) => {
          if (!old) return old;
          
          return {
            ...old,
            orders: old.orders.map(order =>
              order.id === orderId ? { ...order, status } : order
            )
          };
        }
      );
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error('Error al actualizar el estado de la orden');
    },
    onSuccess: (data, { status }) => {
      const statusLabels: Record<string, string> = {
        'PROCESSING': 'procesando',
        'COMPLETED': 'completada',
        'CANCELLED': 'cancelada'
      };
      
      toast.success(`Orden marcada como ${statusLabels[status] || status}`);
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['business', 'orders'],
        refetchType: 'none' // Don't refetch immediately since we have optimistic update
      });
    },
    onSettled: () => {
      // Always refetch after 2 seconds to ensure consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['business', 'orders'] });
      }, 2000);
    },
  });
};