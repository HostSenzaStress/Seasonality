import './globals.css';
import Link from 'next/link';
import { TrendingUp, Home, CalendarDays } from 'lucide-react';

export const metadata = {
  title: 'Seasonality Hub — Analisi statistica stagionalità',
  description:
    'Piattaforma di analisi statistica delle stagionalità storiche sui mercati finanziari. Non è un servizio di segnali di trading.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gradient-to-b from-white via-violet-50/40 to-white text-slate-900 antialiased">
        <header className="sticky top-0 z-40 w-full border-b border-violet-100/60 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold tracking-tight text-slate-900">Seasonality Hub</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-violet-600">Analisi statistica</span>
              </div>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
              >
                <Home className="h-4 w-4" /> <span className="hidden sm:inline">Home</span>
              </Link>
              <Link
                href="/calendario"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
              >
                <CalendarDays className="h-4 w-4" /> <span className="hidden sm:inline">Calendario</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>

        <footer className="mx-auto mt-16 max-w-7xl px-4 pb-10 sm:px-6">
          <div className="rounded-2xl border border-violet-100 bg-white/60 p-5 text-xs text-slate-500 shadow-sm">
            <p className="font-semibold text-slate-700">Disclaimer statistico</p>
            <p className="mt-1 leading-relaxed">
              Lo score e le metriche mostrate rappresentano <strong>un indice statistico basato su dati storici</strong>{' '}
              e <strong>non costituiscono in alcun modo una probabilità futura</strong>, una previsione o un consiglio
              finanziario. Questa piattaforma non fornisce segnali di trading e non deve essere utilizzata per
              prendere decisioni di investimento.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
