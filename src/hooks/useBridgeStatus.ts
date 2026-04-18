import { useQuery } from '@tanstack/react-query';
import { getBridgeStatus } from '@/lib/bridgeStatus';

export function useBridgeStatus() {
  return useQuery({
    queryKey: ['bridge-status'],
    queryFn: getBridgeStatus,
    refetchInterval: 5000,
    staleTime: 2000,
    retry: 1,
  });
}
