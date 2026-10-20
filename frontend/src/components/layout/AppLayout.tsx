import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

import logoFull from '@/assets/tbsb.png';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/features/auth/auth-context';
import { useProfile } from '@/features/profile/api';
import { cn } from '@/lib/cn';
import { resolveAssetUrl } from '@/lib/env';

const navigation = [
  { to: '/report', label: 'New report', icon: ClipboardList },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { signOut, staffId } = useAuth();
  const { data: profile } = useProfile();
  const name = profile?.display_name ?? staffId ?? '';

  return (
    <div className="flex h-full flex-col">
      <Link to="/report" onClick={onNavigate} className="flex items-center gap-3 px-5 py-5">
        <img src={logoFull} alt="TBSB" className="h-8 w-auto" />
        <span className="border-l border-slate-200 pl-3 text-sm font-bold tracking-tight text-slate-900">
          e-UCUA
        </span>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-800 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar
            name={name || '?'}
            src={resolveAssetUrl(profile?.profile_pic_url)}
            className="h-9 w-9 text-xs"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
            <p className="truncate text-xs text-slate-500">{staffId}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut('manual')}
            aria-label="Sign out"
            title="Sign out"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-accent-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Scroll to the top on navigation, like a full page load would.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Link to="/report" className="flex items-center gap-2">
          <img src={logoFull} alt="TBSB" className="h-7 w-auto" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] animate-slide-in-left bg-white shadow-elevated">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:ml-64 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
