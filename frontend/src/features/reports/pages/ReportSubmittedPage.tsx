import { Check, LayoutDashboard, Plus } from 'lucide-react';

import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ReportSubmittedPageProps {
  audience: 'staff' | 'visitor';
}

export default function ReportSubmittedPage({ audience }: ReportSubmittedPageProps) {
  const isStaff = audience === 'staff';

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg items-center">
      <Card className="w-full animate-fade-in-up px-6 py-10 text-center sm:px-10">
        <div className="mx-auto flex h-20 w-20 animate-scale-in items-center justify-center rounded-full bg-emerald-100">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Report submitted</h1>
        <p className="mt-2 text-sm text-slate-500">
          Thank you for helping keep TBSB safe. The QHSE team has received your observation.
          {isStaff && ' Your points have been updated.'}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isStaff && (
            <ButtonLink to="/dashboard" variant="secondary" size="lg">
              <LayoutDashboard className="h-4 w-4" />
              View dashboard
            </ButtonLink>
          )}
          <ButtonLink to={isStaff ? '/report' : '/visitor/report'} size="lg">
            <Plus className="h-4 w-4" />
            Submit another
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
