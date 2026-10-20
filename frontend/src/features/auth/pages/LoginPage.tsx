import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input, PasswordInput } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/errors';

import { authApi } from '../api';
import { useAuth } from '../auth-context';
import { DEFAULT_AUTHENTICATED_ROUTE } from '../guards';
import { loginSchema, type LoginValues } from '../schemas';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? DEFAULT_AUTHENTICATED_ROUTE;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { staff_id: '', password: '' },
  });

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ access_token }) => {
      signIn(access_token);
      navigate(redirectTo, { replace: true });
    },
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your staff ID to submit and track your reports."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800">
            Register here
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit((values) => login.mutate(values))}
        className="space-y-5"
        noValidate
      >
        {login.isError && <Alert tone="error">{getErrorMessage(login.error)}</Alert>}

        <FormField label="Staff ID" htmlFor="staff_id" error={errors.staff_id?.message}>
          <Input
            id="staff_id"
            autoComplete="username"
            autoCapitalize="characters"
            placeholder="e.g. AFE0026"
            invalid={!!errors.staff_id}
            {...register('staff_id')}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>

        <div className="flex justify-end">
          <Link
            to="/reset-password"
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={login.isPending}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
