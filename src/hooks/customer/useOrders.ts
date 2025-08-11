import { useQuery } from '@tanstack/react-query';

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  store: {
    id: string;
    name: string;
    slug: string;
    business: {
      id: string;
      name: string;
      email: string;
    };
  };
  items: OrderItem[];
}

export interface OrdersResponse {
  orders: CustomerOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const fetchCustomerOrders = async (): Promise<OrdersResponse> => {
  const response = await fetch('/api/orders');
  if (!response.ok) {
    throw new Error('Error al cargar las órdenes');
  }
  
  return response.json();
};

export const useCustomerOrders = () => {
  return useQuery({
    queryKey: ['customer', 'orders'],
    queryFn: fetchCustomerOrders,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};