import { ArrowRight, HardHat, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import heroImage from '@/assets/hero.webp';
import logoFull from '@/assets/tbsb.png';

interface EntryCardProps {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
  cta: string;
}

function EntryCard({ to, icon, title, description, cta }: EntryCardProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-white/15 bg-white/10 p-6 text-left text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-900 shadow-sm">
        {icon}
      </span>
      <span className="mt-5 text-lg font-semibold">{title}</span>
      <span className="mt-1 text-sm text-brand-100">{description}</span>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold">
        {cta}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-brand-950">
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/80 via-brand-950/70 to-brand-950" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="rounded-xl bg-white px-3.5 py-2 shadow-elevated">
          <img src={logoFull} alt="Tok Bali Supply Base" className="h-7 w-auto sm:h-8" />
        </div>
        <Link to="/login" className="text-sm font-semibold text-white/90 hover:text-white">
          Staff sign in
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-12 sm:px-8">
        <div className="max-w-2xl animate-fade-in-up">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-100 backdrop-blur">
            Unsafe Condition · Unsafe Act
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            See something unsafe?
            <br />
            <span className="text-accent-400">Report it in a minute.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-brand-100 sm:text-lg">
            e-UCUA is the behaviour and condition monitoring system for Tok Bali Supply Base. Every
            report helps the QHSE team prevent incidents before they happen.
          </p>
        </div>

        <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          <EntryCard
            to="/visitor/report"
            icon={<UserRound className="h-5 w-5" />}
            title="I'm a visitor"
            description="Contractors, drivers and guests. No account needed."
            cta="Report as visitor"
          />
          <EntryCard
            to="/login"
            icon={<HardHat className="h-5 w-5" />}
            title="I'm TBSB staff"
            description="Sign in to report, earn points and track your progress."
            cta="Sign in"
          />
        </div>
      </main>

      <footer className="relative z-10 px-5 py-6 text-center text-xs text-brand-200 sm:px-8">
        © {new Date().getFullYear()} TBSB Sdn Bhd · Tok Bali, Kelantan, Malaysia
      </footer>
    </div>
  );
}
