import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input, PasswordInput } from '@/components/ui/Input';
import { getErrorMessage } from '@/lib/errors';

import { authApi } from '../api';
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { staff_id: '', new_password: '', confirm_password: '' },
  });

  const reset = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password updated. Sign in with your new password.');
      navigate('/login');
    },
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your staff ID and choose a new password."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      }
    >
      <form
        onSubmit={handleSubmit((values) => reset.mutate(values))}
        className="space-y-5"
        noValidate
      >
        {reset.isError && <Alert tone="error">{getErrorMessage(reset.error)}</Alert>}

        <FormField label="Staff ID" htmlFor="staff_id" error={errors.staff_id?.message}>
          <Input
            id="staff_id"
            autoComplete="username"
            invalid={!!errors.staff_id}
            {...register('staff_id')}
          />
        </FormField>
        <FormField
          label="New password"
          htmlFor="new_password"
          error={errors.new_password?.message}
          hint="At least 6 characters"
        >
          <PasswordInput
            id="new_password"
            autoComplete="new-password"
            invalid={!!errors.new_password}
            {...register('new_password')}
          />
        </FormField>
        <FormField
          label="Confirm new password"
          htmlFor="confirm_password"
          error={errors.confirm_password?.message}
        >
          <PasswordInput
            id="confirm_password"
            autoComplete="new-password"
            invalid={!!errors.confirm_password}
            {...register('confirm_password')}
          />
        </FormField>

        <Button type="submit" size="lg" fullWidth loading={reset.isPending}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
