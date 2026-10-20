import { CalendarDays, ClipboardList, Gift, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/components/ui/Card';
import type { UserStats } from '@/types/api';

function StatTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value.toLocaleString()}</p>
      <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

export function PointsSummary({ stats, monthLabel }: { stats: UserStats; monthLabel: string }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Total points · {monthLabel}</p>
          <p className="mt-1 text-6xl font-semibold tracking-tight text-slate-900">
            {stats.total_points.toLocaleString()}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-900">
          <Trophy className="h-4 w-4 text-brand-700" />
          {stats.rank ? `Rank #${stats.rank} this month` : 'Not ranked yet'}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatTile
          icon={<ClipboardList className="h-4 w-4" />}
          label="Reports submitted"
          value={stats.report_count}
          hint="+1 point each"
        />
        <StatTile
          icon={<CalendarDays className="h-4 w-4" />}
          label="Daily points"
          value={stats.daily_points}
          hint="+1 per day you report"
        />
        <StatTile
          icon={<Gift className="h-4 w-4" />}
          label="Bonus points"
          value={stats.bonus_points}
          hint="+5 per day with 3+ reports"
        />
      </div>
    </Card>
  );
}
