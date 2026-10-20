import { CircleCheck, Circle, Plus } from 'lucide-react';

import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { UserStats } from '@/types/api';

import { BONUS_POINTS, BONUS_THRESHOLD } from '../api';

function Goal({ done, label }: { done: boolean; label: string }) {
  const Icon = done ? CircleCheck : Circle;
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <Icon
        className={cn('h-5 w-5 shrink-0', done ? 'text-emerald-600' : 'text-slate-300')}
        aria-hidden
      />
      <span className={done ? 'font-medium text-slate-900' : 'text-slate-500'}>{label}</span>
      <span className="sr-only">{done ? '(done)' : '(not yet)'}</span>
    </li>
  );
}

export function TodayProgress({ stats }: { stats: UserStats }) {
  const progress = Math.min(stats.reports_today, BONUS_THRESHOLD);
  const percent = (progress / BONUS_THRESHOLD) * 100;

  return (
    <Card className="flex flex-col p-5 sm:p-6">
      <p className="text-sm font-medium text-slate-500">Today</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">
        {stats.reports_today === 0
          ? 'No reports yet today'
          : `${stats.reports_today} report${stats.reports_today === 1 ? '' : 's'} today`}
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Daily bonus</span>
          <span>
            {progress} / {BONUS_THRESHOLD}
          </span>
        </div>
        <div
          role="meter"
          aria-label="Reports toward today's bonus"
          aria-valuemin={0}
          aria-valuemax={BONUS_THRESHOLD}
          aria-valuenow={progress}
          className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100"
        >
          <div
            className="h-full rounded-full bg-brand-700 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ul className="mb-auto mt-5 space-y-2.5">
        <Goal done={stats.daily_point_earned_today} label="+1 daily point (1 report)" />
        <Goal
          done={stats.bonus_earned_today}
          label={`+${BONUS_POINTS} bonus (${BONUS_THRESHOLD} reports)`}
        />
      </ul>

      <ButtonLink to="/report" className="mt-6" fullWidth>
        <Plus className="h-4 w-4" />
        New report
      </ButtonLink>
    </Card>
  );
}
