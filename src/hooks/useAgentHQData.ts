import { useQuery } from '@tanstack/react-query';
import { fetchAgentHQData } from '@/lib/agentHq';

export function useAgentHQData() {
  return useQuery({
    queryKey: ['agent-hq-data'],
    queryFn: fetchAgentHQData,
    refetchInterval: 30_000,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}
