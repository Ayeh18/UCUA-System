import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle aria-hidden className={cn('h-5 w-5 animate-spin', className)} />;
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500"
    >
      <Spinner className="h-7 w-7 text-brand-700" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
