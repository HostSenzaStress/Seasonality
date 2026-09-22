'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Info, Sparkles, LineChart } from 'lucide-react';
import { formatPct, formatDateIt, statusColor, classeColor } from '@/lib/format';
import TradingViewWidget from '@/components/TradingViewWidget';

function BigScore({ value }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const stroke = 14;
  const size = 200;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (v / 100) * c;
  return (
    <div className="relative flex h-[200px] w-[200px] items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-violet-100" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="stroke-[url(#big)]"
          fill="none"
        />
        <defs>
          <linearGradient id="big" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-black tracking-tight text-slate-900">{v}</span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-violet-600">Score</span>
      </div>
    </div>
  );
}

function MetricBig({ label, value, tone }) {
  const toneCls =
    tone === 'good'
      ? 'text-emerald-600'
      : tone === 'bad'
      ? 'text-rose-600'
      : 'text-slate-900';
  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-violet-600">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${toneCls}`}>{value}</div>
    </div>
  );
}

export default function DetailPage({ params }) {
  const { id } = use(params);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/seasonalities/${encodeURIComponent(id)}`);
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'errore');
        setItem(j.item);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id]);

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="font-semibold text-rose-700">Impossibile caricare la stagionalità.</p>
        <p className="mt-1 text-xs text-rose-600">{error}</p>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-violet-700 hover:underline">
          ← Torna alla home
        </Link>
      </div>
    );
  }

  if (!item) {
    return <div className="h-96 animate-pulse rounded-3xl border border-violet-100 bg-white/60" />;
  }

  const isUp = item.direzioneRaw === 'LONG';

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Torna alla lista
      </Link>

      <section className="grid grid-cols-1 gap-6 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[220px,1fr]">
        <div className="flex items-center justify-center">
          <BigScore value={item.score} />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{item.asset}</h1>
            {item.classe && (
              <span className={`rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider ${classeColor(item.classe)}`}>
                Classe {item.classe}
              </span>
            )}
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${statusColor(item.status)}`}>
              {item.status}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            {isUp ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <TrendingUp className="h-4 w-4" /> Direzione stagionale rialzista
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                <TrendingDown className="h-4 w-4" /> Direzione stagionale ribassista
              </span>
            )}
            <span className="text-slate-300">•</span>
            <span>
              {formatDateIt(item.periodoStart)} — {formatDateIt(item.periodoEnd)}
            </span>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Avanzamento periodo</span>
              <span>{Math.round(item.progress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  item.status === 'ATTIVA'
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                    : item.status === 'TERMINATA'
                    ? 'bg-slate-300'
                    : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
                }`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>

          <div className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            <Sparkles className="h-3.5 w-3.5" /> Affidabilità statistica: indice storico
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-violet-700">Metriche statistiche storiche</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <MetricBig label="Win Rate 10 anni" value={formatPct(item.wr10, 0)} tone="good" />
          <MetricBig label="Win Rate 20 anni" value={formatPct(item.wr20, 0)} tone="good" />
          <MetricBig label="Avg Return medio" value={formatPct(item.avgMedio)} />
          <MetricBig label="Avg 10 anni" value={formatPct(item.avg10)} />
          <MetricBig label="Avg 20 anni" value={formatPct(item.avg20)} />
          <MetricBig label="Movimento opposto" value={formatPct(item.avgOpposto)} tone="bad" />
          <MetricBig label="Drawdown medio" value={formatPct(item.ddMedio)} tone="bad" />
          <MetricBig label="Drawdown massimo" value={formatPct(item.ddMax)} tone="bad" />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-violet-700">
            Grafico &mdash; {item.asset}
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-violet-700">
            <LineChart className="h-3.5 w-3.5" /> Timeframe Daily
          </span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white p-2 shadow-sm">
          <TradingViewWidget symbol={item.ticker || item.asset} />
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          Grafico fornito da TradingView. Se il simbolo non viene riconosciuto automaticamente,
          usa la barra di ricerca del widget per selezionare l&apos;asset corretto.
        </p>
      </section>

      <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Cosa rappresenta lo score?</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Lo score da 1 a 100 è un <strong>indice statistico calcolato sui dati storici</strong> del comportamento
              stagionale dell&apos;asset. <strong>Non rappresenta una probabilità futura</strong>, non è una previsione e non
              costituisce alcun tipo di consiglio finanziario o operativo.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
