import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/lib/liveData';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: getDashboardData,
    refetchInterval: 15_000,
    staleTime: 5_000,
  });
}
