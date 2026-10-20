import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type ChoiceTone = 'brand' | 'emerald' | 'amber' | 'red' | 'slate';

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
  tone?: ChoiceTone;
}

const selectedTone: Record<ChoiceTone, string> = {
  brand: 'border-brand-600 bg-brand-50 ring-brand-600',
  emerald: 'border-emerald-600 bg-emerald-50 ring-emerald-600',
  amber: 'border-amber-500 bg-amber-50 ring-amber-500',
  red: 'border-accent-600 bg-accent-50 ring-accent-600',
  slate: 'border-slate-700 bg-slate-50 ring-slate-700',
};

const iconTone: Record<ChoiceTone, string> = {
  brand: 'bg-brand-100 text-brand-800',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-accent-100 text-accent-700',
  slate: 'bg-slate-100 text-slate-700',
};

interface ChoiceCardsProps<T extends string> {
  name: string;
  options: readonly ChoiceOption<T>[];
  value: T | '' | undefined;
  onChange: (value: T) => void;
  invalid?: boolean;
  columns?: 2 | 3;
  'aria-labelledby'?: string;
}

/** An accessible radio group rendered as large, tappable cards (keyboard: arrow keys via native radios). */
export function ChoiceCards<T extends string>({
  name,
  options,
  value,
  onChange,
  invalid,
  columns = 3,
  ...aria
}: ChoiceCardsProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-invalid={invalid || undefined}
      {...aria}
      className={cn('grid gap-3', columns === 3 ? 'sm:grid-cols-3' : 'grid-cols-2')}
    >
      {options.map((option) => {
        const tone = option.tone ?? 'brand';
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              'relative flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-3.5 transition-all hover:border-slate-400 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500',
              checked
                ? cn('ring-1', selectedTone[tone])
                : invalid
                  ? 'border-accent-300'
                  : 'border-slate-200',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.icon && (
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  iconTone[tone],
                )}
              >
                {option.icon}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
              {option.description && (
                <span className="mt-0.5 block text-xs text-slate-500">{option.description}</span>
              )}
            </span>
            <span
              aria-hidden
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition',
                checked ? 'border-transparent bg-slate-900 text-white' : 'border-slate-300',
              )}
            >
              {checked && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
          </label>
        );
      })}
    </div>
  );
}
