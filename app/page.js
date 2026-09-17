'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, TrendingUp, TrendingDown, ArrowUpRight, Info, RefreshCw, Sparkles } from 'lucide-react';
import { formatPct, formatDateItShort, statusColor, classeColor, formatNum } from '@/lib/format';

function ScoreRing({ value }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const stroke = 6;
  const size = 56;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-violet-100" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="stroke-[url(#g1)]"
          fill="none"
        />
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-sm font-bold text-slate-900">{v}</span>
    </div>
  );
}

function Progress({ value, status }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const barColor =
    status === 'ATTIVA'
      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
      : status === 'TERMINATA'
      ? 'bg-slate-300'
      : 'bg-gradient-to-r from-violet-500 to-fuchsia-500';
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${v}%` }} />
    </div>
  );
}

function Card({ item }) {
  const isUp = item.direzioneRaw === 'LONG';
  return (
    <Link
      href={`/dettaglio/${encodeURIComponent(item.id)}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-violet-100 bg-white p-5 shadow-sm shadow-violet-100/40 transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-violet-200/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ScoreRing value={item.score} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg font-bold tracking-tight text-slate-900">{item.asset}</h3>
              {item.classe && (
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${classeColor(item.classe)}`}>
                  {item.classe}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              {isUp ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" /> Rialzista
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-rose-600">
                  <TrendingDown className="h-3.5 w-3.5" /> Ribassista
                </span>
              )}
              <span className="text-slate-300">•</span>
              <span>
                {formatDateItShort(item.periodoStart)} → {formatDateItShort(item.periodoEnd)}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor(item.status)}`}>
          {item.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="WR 10Y" value={formatPct(item.wr10, 0)} />
        <Metric label="WR 20Y" value={formatPct(item.wr20, 0)} />
        <Metric label="Avg Return" value={formatPct(item.avgMedio)} positive={item.direzioneRaw === 'LONG'} />
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-slate-500">
          <span>Avanzamento periodo</span>
          <span>{Math.round(item.progress)}%</span>
        </div>
        <Progress value={item.progress} status={item.status} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 font-medium text-violet-700">
          <Sparkles className="h-3.5 w-3.5" /> Affidabilità statistica
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-slate-600 group-hover:text-violet-700">
          Dettagli <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-violet-50/60 px-2.5 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wider text-violet-600">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-2xl border border-violet-100 bg-white/60" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('TUTTI');
  const [classeFilter, setClasseFilter] = useState('TUTTE');
  const [refreshing, setRefreshing] = useState(false);

  const load = async (force = false) => {
    try {
      setRefreshing(true);
      const r = await fetch(`/api/seasonalities${force ? '?force=1' : ''}`);
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || 'errore');
      setItems(j.items);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const classi = useMemo(() => {
    const s = new Set();
    (items || []).forEach((i) => i.classe && s.add(i.classe));
    return ['TUTTE', ...Array.from(s)];
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((i) => {
      if (q && !i.asset.toLowerCase().includes(q.toLowerCase())) return false;
      if (statusFilter !== 'TUTTI' && i.status !== statusFilter) return false;
      if (classeFilter !== 'TUTTE' && i.classe !== classeFilter) return false;
      return true;
    });
  }, [items, q, statusFilter, classeFilter]);

  const stats = useMemo(() => {
    if (!items) return { tot: 0, attive: 0, arrivo: 0, terminate: 0 };
    return {
      tot: items.length,
      attive: items.filter((i) => i.status === 'ATTIVA').length,
      arrivo: items.filter((i) => i.status === 'IN ARRIVO').length,
      terminate: items.filter((i) => i.status === 'TERMINATA').length,
    };
  }, [items]);

  return (
    <div>
      {/* Hero */}
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-600 via-violet-500 to-fuchsia-600 p-6 text-white shadow-lg shadow-violet-200 sm:p-10">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-fuchsia-300/20 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Analisi statistica storica
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Le stagionalità finanziarie ordinate per <span className="underline decoration-white/40 underline-offset-4">affidabilità statistica</span>.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
            Uno score da 1 a 100 basato esclusivamente su dati storici (10 e 20 anni). Non è una probabilità futura, non
            è un consiglio finanziario.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Totale" value={stats.tot} />
            <Stat label="Attive" value={stats.attive} accent="emerald" />
            <Stat label="In arrivo" value={stats.arrivo} />
            <Stat label="Terminate" value={stats.terminate} />
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca asset (es. AAPL, SUGAR, GOLD)..."
            className="w-full rounded-xl border border-violet-100 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-xl border border-violet-100 bg-white p-1 shadow-sm">
            {['TUTTI', 'IN ARRIVO', 'ATTIVA', 'TERMINATA'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition ${
                  statusFilter === s ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-violet-50'
                }`}
              >
                {s === 'TUTTI' ? 'Tutti' : s}
              </button>
            ))}
          </div>
          <select
            value={classeFilter}
            onChange={(e) => setClasseFilter(e.target.value)}
            className="rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            {classi.map((c) => (
              <option key={c} value={c}>
                {c === 'TUTTE' ? 'Tutte le classi' : `Classe ${c}`}
              </option>
            ))}
          </select>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-violet-100 bg-white px-3 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Aggiorna
          </button>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <Info className="mt-0.5 h-4 w-4" />
          <div>
            <p className="font-semibold">Impossibile caricare i dati dal Google Sheet.</p>
            <p className="mt-1 text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      {items === null ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-violet-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">Nessuna stagionalità trovata con i filtri correnti.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-white/70">{label}</div>
      <div className="mt-0.5 text-2xl font-bold">{value}</div>
    </div>
  );
}
