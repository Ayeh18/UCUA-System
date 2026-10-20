import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
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
import { registerSchema, type RegisterValues } from '../schemas';

type TextField = {
  name: Exclude<keyof RegisterValues, 'password' | 'confirm_password'>;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  optional?: boolean;
};

const fields: TextField[] = [
  { name: 'staff_id', label: 'Staff ID', placeholder: 'e.g. AFE0026', autoComplete: 'username' },
  { name: 'name', label: 'Full name', placeholder: 'As per IC', autoComplete: 'name' },
  {
    name: 'designation',
    label: 'Designation',
    placeholder: 'e.g. Operator',
    autoComplete: 'organization-title',
  },
  { name: 'department', label: 'Department', placeholder: 'e.g. AFE' },
  { name: 'dept_qhse', label: 'QHSE department', placeholder: 'e.g. AFE' },
  {
    name: 'phone',
    label: 'Phone number',
    placeholder: '012-345 6789',
    type: 'tel',
    autoComplete: 'tel',
  },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'you@company.com',
    type: 'email',
    autoComplete: 'email',
    optional: true,
  },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      staff_id: '',
      name: '',
      designation: '',
      department: '',
      dept_qhse: '',
      phone: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const registration = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Account created. You can now sign in.');
      navigate('/login');
    },
  });

  return (
    <AuthLayout
      wide
      title="Create your account"
      subtitle="Register once with your staff details to start reporting."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800">
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={handleSubmit((values) => registration.mutate(values))}
        className="space-y-6"
        noValidate
      >
        {registration.isError && <Alert tone="error">{getErrorMessage(registration.error)}</Alert>}

        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <FormField
              key={field.name}
              label={field.label}
              htmlFor={field.name}
              optional={field.optional}
              required={!field.optional}
              error={errors[field.name]?.message}
            >
              <Input
                id={field.name}
                type={field.type ?? 'text'}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                invalid={!!errors[field.name]}
                {...register(field.name)}
              />
            </FormField>
          ))}
        </div>

        <div className="grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <FormField
            label="Password"
            required
            htmlFor="password"
            error={errors.password?.message}
            hint="At least 6 characters"
          >
            <PasswordInput
              id="password"
              autoComplete="new-password"
              invalid={!!errors.password}
              {...register('password')}
            />
          </FormField>
          <FormField
            label="Confirm password"
            required
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
        </div>

        <Button type="submit" size="lg" fullWidth loading={registration.isPending}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
