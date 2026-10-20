import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import type { DashboardSummary } from '@/types/api';

export const BONUS_THRESHOLD = 3;
export const BONUS_POINTS = 5;

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiClient.get<DashboardSummary>('/dashboard').then((r) => r.data),
    refetchOnWindowFocus: true,
  });
}
