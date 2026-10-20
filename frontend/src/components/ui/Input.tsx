import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { useState, type ComponentProps } from 'react';

import { cn } from '@/lib/cn';

interface ControlProps {
  invalid?: boolean;
}

export function Input({ invalid, className, ...props }: ComponentProps<'input'> & ControlProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn('field-control', invalid && 'field-control-invalid', className)}
      {...props}
    />
  );
}

export function Textarea({
  invalid,
  className,
  rows = 4,
  ...props
}: ComponentProps<'textarea'> & ControlProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn('field-control resize-y', invalid && 'field-control-invalid', className)}
      {...props}
    />
  );
}

interface SelectProps extends ComponentProps<'select'>, ControlProps {
  options: readonly string[];
  placeholder?: string;
}

export function Select({ invalid, className, options, placeholder, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          'field-control appearance-none pr-10',
          invalid && 'field-control-invalid',
          className,
        )}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

export function PasswordInput({
  className,
  ...props
}: Omit<ComponentProps<'input'>, 'type'> & ControlProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-11', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-400 hover:text-slate-600"
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  );
}
