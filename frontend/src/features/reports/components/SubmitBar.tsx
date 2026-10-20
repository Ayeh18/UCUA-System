import { Send } from 'lucide-react';

import { Button } from '@/components/ui/Button';

/** Sticky footer with the primary submit action, always reachable on long forms and small screens. */
export function SubmitBar({ loading, onReset }: { loading: boolean; onReset?: () => void }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:shadow-elevated">
      <div className="flex items-center justify-between gap-3">
        <p className="hidden text-xs text-slate-500 sm:block">
          Fields marked <span className="text-accent-600">*</span> are required.
        </p>
        <div className="flex flex-1 gap-3 sm:flex-none">
          {onReset && (
            <Button variant="ghost" onClick={onReset} disabled={loading}>
              Clear
            </Button>
          )}
          <Button type="submit" size="lg" loading={loading} className="flex-1 sm:flex-none">
            {!loading && <Send className="h-4 w-4" />}
            {loading ? 'Submitting…' : 'Submit report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
