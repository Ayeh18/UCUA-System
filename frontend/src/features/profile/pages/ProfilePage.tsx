import { Briefcase, Building, Camera, IdCard, Mail, Pencil, Phone } from 'lucide-react';
import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { toast } from 'sonner';

import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PageLoader, Spinner } from '@/components/ui/Spinner';
import { resolveAssetUrl } from '@/lib/env';
import { getErrorMessage } from '@/lib/errors';

import { useProfile, useUploadAvatar } from '../api';

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_MB = 5;

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
        <dd
          className={
            value ? 'truncate text-sm font-medium text-slate-900' : 'text-sm italic text-slate-400'
          }
        >
          {value || 'Not provided'}
        </dd>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const profile = useProfile();
  const upload = useUploadAvatar();
  const fileInput = useRef<HTMLInputElement>(null);

  const onAvatarSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error('Please choose a JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_AVATAR_MB} MB.`);
      return;
    }
    upload.mutate(file, {
      onSuccess: () => toast.success('Profile picture updated.'),
      onError: (error) => toast.error(getErrorMessage(error, 'Could not update your picture.')),
    });
  };

  if (profile.isPending) return <PageLoader label="Loading profile…" />;
  if (profile.isError) return <Alert tone="error">{getErrorMessage(profile.error)}</Alert>;

  const user = profile.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-600 sm:h-40">
          <div className="h-full w-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
        </div>
        <div className="flex flex-col items-center gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative -mt-14 sm:-mt-12">
            <Avatar
              name={user.display_name}
              src={resolveAssetUrl(user.profile_pic_url)}
              className="h-28 w-28 text-3xl ring-4 ring-white sm:h-32 sm:w-32"
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={upload.isPending}
              aria-label="Change profile picture"
              className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-brand-800 text-white shadow-md transition hover:bg-brand-700 disabled:opacity-70"
            >
              {upload.isPending ? <Spinner className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept={AVATAR_TYPES.join(',')}
              onChange={onAvatarSelected}
              className="sr-only"
            />
          </div>
          <div className="flex-1 text-center sm:pb-1 sm:text-left">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{user.display_name}</h1>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
              <IdCard className="h-3.5 w-3.5" />
              {user.staff_id}
            </p>
          </div>
          <ButtonLink to="/profile/edit" variant="secondary">
            <Pencil className="h-4 w-4" />
            Edit profile
          </ButtonLink>
        </div>
      </Card>

      <Card>
        <CardHeader title="Details" description="Shown on your reports and to the QHSE team." />
        <CardContent className="py-0">
          <dl className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0">
            <DetailRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
            <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone} />
            <DetailRow
              icon={<Briefcase className="h-4 w-4" />}
              label="Designation"
              value={user.designation}
            />
            <DetailRow
              icon={<Building className="h-4 w-4" />}
              label="Department"
              value={user.department}
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
