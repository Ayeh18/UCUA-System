import { LogIn } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';

import logoFull from '@/assets/tbsb.png';
import { ButtonLink } from '@/components/ui/Button';

/** Minimal chrome for pages that visitors use without an account. */
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoFull} alt="TBSB home" className="h-8 w-auto" />
            <span className="hidden border-l border-slate-200 pl-3 text-sm font-semibold text-slate-700 sm:inline">
              e-UCUA
            </span>
          </Link>
          <ButtonLink to="/login" variant="secondary" size="sm">
            <LogIn className="h-4 w-4" />
            Staff sign in
          </ButtonLink>
        </div>
      </header>
      <main className="px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
