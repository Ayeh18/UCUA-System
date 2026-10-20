import type { ComponentProps } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

import { cn } from '@/lib/cn';

import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'white';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 select-none disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-800 text-white shadow-sm hover:bg-brand-700',
  secondary:
    'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-accent-600 text-white shadow-sm hover:bg-accent-700',
  white: 'bg-white text-brand-900 shadow-sm hover:bg-brand-50',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

function buttonClasses({ variant = 'primary', size = 'md', fullWidth }: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full');
}

interface ButtonProps extends ComponentProps<'button'>, StyleProps {
  loading?: boolean;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: LinkProps & StyleProps) {
  return <Link className={cn(buttonClasses({ variant, size, fullWidth }), className)} {...props} />;
}
