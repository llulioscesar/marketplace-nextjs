import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  totalStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    customer: {
      name: string;
    };
    store: {
      name: string;
    };
  }>;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/api/business/dashboard');
  if (!response.ok) {
    throw new Error('Error al cargar las estadísticas del dashboard');
  }
  
  return response.json();
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['business', 'dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to dashboard
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
};