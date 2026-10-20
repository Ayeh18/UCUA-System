import { Medal, Trophy } from 'lucide-react';

import { Card, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { LeaderboardEntry, UserStats } from '@/types/api';

const medalColor: Record<number, string> = {
  1: 'text-amber-500',
  2: 'text-slate-400',
  3: 'text-orange-700',
};

function RankCell({ rank }: { rank: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-slate-700">
      {medalColor[rank] ? (
        <Medal className={cn('h-4 w-4', medalColor[rank])} aria-hidden />
      ) : (
        <span className="w-4" />
      )}
      {rank}
    </span>
  );
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUser: string;
  currentStats: UserStats;
  monthLabel: string;
}

export function Leaderboard({ entries, currentUser, currentStats, monthLabel }: LeaderboardProps) {
  const userInTop = entries.some((entry) => entry.staff_id === currentUser);
  const showOwnRow = !userInTop && currentStats.rank !== null;

  return (
    <Card>
      <CardHeader
        icon={<Trophy className="h-4 w-4" />}
        title="Leaderboard"
        description={`Top contributors for ${monthLabel}`}
      />
      {entries.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">No reports yet this month</p>
          <p className="mt-1 text-sm text-slate-500">
            Be the first to submit one and claim the top spot.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th scope="col" className="px-5 py-3 sm:px-6">
                  Rank
                </th>
                <th scope="col" className="px-3 py-3">
                  Staff
                </th>
                <th scope="col" className="px-3 py-3 text-right">
                  Reports
                </th>
                <th scope="col" className="px-5 py-3 text-right sm:px-6">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => {
                const isMe = entry.staff_id === currentUser;
                return (
                  <tr
                    key={entry.staff_id}
                    className={isMe ? 'bg-brand-50/70' : 'hover:bg-slate-50'}
                  >
                    <td className="px-5 py-3.5 sm:px-6">
                      <RankCell rank={entry.rank} />
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {entry.name ?? entry.staff_id}
                        </span>
                        {isMe && (
                          <span className="rounded-full bg-brand-800 px-2 py-0.5 text-[11px] font-semibold text-white">
                            You
                          </span>
                        )}
                      </div>
                      {entry.name && <p className="text-xs text-slate-400">{entry.staff_id}</p>}
                    </td>
                    <td className="px-3 py-3.5 text-right tabular-nums text-slate-600">
                      {entry.reports}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-slate-900 sm:px-6">
                      {entry.points}
                    </td>
                  </tr>
                );
              })}
              {showOwnRow && (
                <tr className="border-t-2 border-dashed border-slate-200 bg-brand-50/70">
                  <td className="px-5 py-3.5 sm:px-6">
                    <RankCell rank={currentStats.rank!} />
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="rounded-full bg-brand-800 px-2 py-0.5 text-[11px] font-semibold text-white">
                      You
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums text-slate-600">
                    {currentStats.report_count}
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-slate-900 sm:px-6">
                    {currentStats.total_points}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
