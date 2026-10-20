import { ClipboardCheck, ShieldCheck, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import logoFull from '@/assets/tbsb.png';
import portImage from '@/assets/port.webp';

const highlights = [
  { icon: ClipboardCheck, text: 'Report unsafe acts and conditions in under a minute' },
  { icon: ShieldCheck, text: 'Call for stop work when lives are at risk' },
  { icon: Trophy, text: 'Earn points and climb the monthly leaderboard' },
];

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function AuthLayout({ title, subtitle, children, footer, wide }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <aside className="relative hidden w-[44%] max-w-2xl overflow-hidden lg:block">
        <img src={portImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/95 via-brand-900/85 to-brand-800/70" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white xl:p-14">
          <Link
            to="/"
            className="inline-flex w-fit rounded-xl bg-white px-4 py-2.5 shadow-elevated"
          >
            <img src={logoFull} alt="TBSB home" className="h-8 w-auto" />
          </Link>
          <div className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-200">
                e-UCUA
              </p>
              <h2 className="mt-3 text-4xl font-bold leading-tight xl:text-5xl">
                Safety starts
                <br />
                with you.
              </h2>
            </div>
            <ul className="space-y-4">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-brand-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-brand-200">Tok Bali Supply Base · Kelantan, Malaysia</p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className={wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
            <Link to="/" className="mb-8 inline-block lg:hidden">
              <img src={logoFull} alt="TBSB home" className="h-9 w-auto" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
            <div className="mt-8 animate-fade-in-up">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
        <p className="pb-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} TBSB Sdn Bhd. All rights reserved.
        </p>
      </main>
    </div>
  );
}
