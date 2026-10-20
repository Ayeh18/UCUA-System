import { CalendarDays, ClipboardList, Gift, Info } from 'lucide-react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { useProfile } from '@/features/profile/api';
import { getErrorMessage } from '@/lib/errors';

import { BONUS_POINTS, BONUS_THRESHOLD, useDashboard } from '../api';
import { Leaderboard } from '../components/Leaderboard';
import { PointsSummary } from '../components/PointsSummary';
import { TodayProgress } from '../components/TodayProgress';

const rules = [
  { icon: ClipboardList, title: '+1 per report', text: 'Every report you submit earns a point.' },
  {
    icon: CalendarDays,
    title: '+1 per active day',
    text: 'Report at least once in a day for a daily point.',
  },
  {
    icon: Gift,
    title: `+${BONUS_POINTS} bonus`,
    text: `Submit ${BONUS_THRESHOLD} or more reports in a single day.`,
  },
];

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const dashboard = useDashboard();
  const profile = useProfile();

  if (dashboard.isPending) return <PageLoader label="Loading dashboard…" />;
  if (dashboard.isError) {
    return (
      <Alert tone="error">
        {getErrorMessage(dashboard.error)}{' '}
        <Button variant="ghost" size="sm" onClick={() => dashboard.refetch()}>
          Retry
        </Button>
      </Alert>
    );
  }

  const { stats, leaderboard, current_user, period_start } = dashboard.data;
  const monthLabel = new Date(`${period_start}T00:00:00`).toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric',
  });
  const firstName = profile.data?.display_name.split(' ')[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow={monthLabel}
        title={firstName ? `${greeting()}, ${firstName}` : 'Dashboard'}
        description="Your safety reporting this month. Points reset on the 1st of every month."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PointsSummary stats={stats} monthLabel={monthLabel} />
        </div>
        <TodayProgress stats={stats} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Leaderboard
            entries={leaderboard}
            currentUser={current_user}
            currentStats={stats}
            monthLabel={monthLabel}
          />
        </div>
        <Card>
          <CardHeader icon={<Info className="h-4 w-4" />} title="How points work" />
          <CardContent>
            <ul className="space-y-4">
              {rules.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-500">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
