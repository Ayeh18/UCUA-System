import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface FormFieldProps {
  label: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  optional,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-medium text-slate-700"
      >
        {label}
        {required && (
          <span className="text-accent-600" aria-hidden>
            *
          </span>
        )}
        {optional && <span className="font-normal text-slate-400">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-accent-700">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}
