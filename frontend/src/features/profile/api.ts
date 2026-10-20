import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { useAuth } from '@/features/auth/auth-context';
import { apiClient } from '@/lib/api-client';
import type { UserProfile } from '@/types/api';

export const profileQueryKey = ['profile', 'me'] as const;

export const profileSchema = z.object({
  username: z.string().trim().min(1, 'Display name is required').max(255),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]),
  phone: z.string().trim().max(255),
  designation: z.string().trim().max(255),
  department: z.string().trim().max(255),
});

export type ProfileValues = z.infer<typeof profileSchema>;

export function useProfile() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: () => apiClient.get<UserProfile>('/users/me').then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, ...values }: ProfileValues) =>
      apiClient
        .put<UserProfile>('/users/me', { ...values, email: email || null })
        .then((r) => r.data),
    onSuccess: (profile) => queryClient.setQueryData(profileQueryKey, profile),
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('profile_pic', file);
      return apiClient.post<UserProfile>('/users/me/avatar', form).then((r) => r.data);
    },
    onSuccess: (profile) => queryClient.setQueryData(profileQueryKey, profile),
  });
}
