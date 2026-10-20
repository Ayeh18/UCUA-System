import { apiClient } from '@/lib/api-client';
import type { MessageResponse, TokenResponse } from '@/types/api';

import type { LoginValues, RegisterValues, ResetPasswordValues } from './schemas';

export const authApi = {
  login: (values: LoginValues) =>
    apiClient.post<TokenResponse>('/auth/login', values).then((r) => r.data),

  register: ({ confirm_password: _, email, ...values }: RegisterValues) =>
    apiClient
      .post<MessageResponse>('/auth/register', { ...values, email: email || null })
      .then((r) => r.data),

  resetPassword: ({ staff_id, new_password }: ResetPasswordValues) =>
    apiClient
      .post<MessageResponse>('/auth/reset-password', { staff_id, new_password })
      .then((r) => r.data),
};
