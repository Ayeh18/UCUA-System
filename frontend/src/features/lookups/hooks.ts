import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

// Reference data rarely changes; cache it for the whole session.
const LOOKUP_STALE_TIME = 30 * 60 * 1000;

export function useLocations() {
  return useQuery({
    queryKey: ['lookups', 'locations'],
    queryFn: () => apiClient.get<string[]>('/lookups/locations').then((r) => r.data),
    staleTime: LOOKUP_STALE_TIME,
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ['lookups', 'companies'],
    queryFn: () => apiClient.get<string[]>('/lookups/companies').then((r) => r.data),
    staleTime: LOOKUP_STALE_TIME,
  });
}
