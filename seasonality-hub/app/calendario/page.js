'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { formatDateItShort, statusColor, classeColor, formatPct } from '@/lib/format';

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

export default function CalendarPage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/seasonalities');
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'errore');
        setItems(j.items);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    if (!items) return {};
    const withDates = items
      .filter((i) => i.periodoStart)
      .slice()
      .sort((a, b) => new Date(a.periodoStart) - new Date(b.periodoStart));
    const g = {};
    for (const i of withDates) {
      const d = new Date(i.periodoStart);
      const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      const label = `${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
      if (!g[key]) g[key] = { label, items: [] };
      g[key].items.push(i);
    }
    return g;
  }, [items]);

  const keys = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <section className="flex items-center gap-4 rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calendario stagionalità</h1>
          <p className="text-sm text-slate-600">Tutte le stagionalità ordinate cronologicamente per data di inizio.</p>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}

      {items === null ? (
        <div className="h-96 animate-pulse rounded-2xl border border-violet-100 bg-white/60" />
      ) : keys.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-violet-200 bg-white p-10 text-center text-sm text-slate-600">
          Nessuna stagionalità con date valide.
        </div>
      ) : (
        <div className="space-y-8">
          {keys.map((k) => (
            <div key={k}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">{grouped[k].label}</h2>
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-700">
                  {grouped[k].items.length} stagionalità
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-violet-200 to-transparent" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[k].items.map((it) => (
                  <Row key={it.id} item={it} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ item }) {
  const isUp = item.direzioneRaw === 'LONG';
  return (
    <Link
      href={`/dettaglio/${encodeURIComponent(item.id)}`}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-violet-200/40"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-700">
          <span className="text-[9px] font-bold uppercase tracking-widest">
            {formatDateItShort(item.periodoStart).split(' ')[1]}
          </span>
          <span className="text-lg font-black leading-none">
            {formatDateItShort(item.periodoStart).split(' ')[0]}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-bold text-slate-900">{item.asset}</span>
            {item.classe && (
              <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${classeColor(item.classe)}`}>
                {item.classe}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            {isUp ? (
              <TrendingUp className="h-3 w-3 text-emerald-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-rose-600" />
            )}
            <span>{formatDateItShort(item.periodoStart)} → {formatDateItShort(item.periodoEnd)}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold">
            <span className={`rounded-full border px-1.5 py-0.5 uppercase tracking-wider ${statusColor(item.status)}`}>
              {item.status}
            </span>
            <span className="text-violet-700">Score {item.score ?? '—'}</span>
            <span className="text-slate-500">WR20 {formatPct(item.wr20, 0)}</span>
          </div>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-violet-600" />
    </Link>
  );
}
