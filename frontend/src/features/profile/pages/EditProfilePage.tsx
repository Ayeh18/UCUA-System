import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { getErrorMessage } from '@/lib/errors';
import type { UserProfile } from '@/types/api';

import { profileSchema, useProfile, useUpdateProfile, type ProfileValues } from '../api';

const fields: {
  name: keyof ProfileValues;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}[] = [
  {
    name: 'username',
    label: 'Display name',
    required: true,
    placeholder: 'How your name appears in the app',
  },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@company.com' },
  { name: 'phone', label: 'Phone number', type: 'tel', placeholder: '012-345 6789' },
  { name: 'designation', label: 'Designation', placeholder: 'e.g. Operator' },
  { name: 'department', label: 'Department', placeholder: 'e.g. AFE' },
];

function EditProfileForm({ user }: { user: UserProfile }) {
  const navigate = useNavigate();
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user.username ?? user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      designation: user.designation ?? '',
      department: user.department ?? '',
    },
  });

  const onSubmit = handleSubmit((values) =>
    update.mutate(values, {
      onSuccess: () => {
        toast.success('Profile updated.');
        navigate('/profile');
      },
    }),
  );

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {update.isError && <Alert tone="error">{getErrorMessage(update.error)}</Alert>}

          <FormField label="Staff ID" htmlFor="staff_id" hint="Your staff ID can't be changed.">
            <Input id="staff_id" value={user.staff_id} disabled readOnly />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field) => (
              <FormField
                key={field.name}
                label={field.label}
                htmlFor={field.name}
                required={field.required}
                error={errors[field.name]?.message}
                className={field.name === 'username' ? 'sm:col-span-2' : undefined}
              >
                <Input
                  id={field.name}
                  type={field.type ?? 'text'}
                  placeholder={field.placeholder}
                  invalid={!!errors[field.name]}
                  {...register(field.name)}
                />
              </FormField>
            ))}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <ButtonLink to="/profile" variant="secondary">
              Cancel
            </ButtonLink>
            <Button type="submit" loading={update.isPending} disabled={!isDirty}>
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function EditProfilePage() {
  const profile = useProfile();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit profile" description="Keep your contact details up to date." />
      {profile.isPending && <PageLoader />}
      {profile.isError && <Alert tone="error">{getErrorMessage(profile.error)}</Alert>}
      {profile.data && <EditProfileForm user={profile.data} />}
    </div>
  );
}
