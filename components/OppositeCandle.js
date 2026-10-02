'use client';

import { BellRing, Check, Lock, Sheet, Zap } from 'lucide-react';

// Stati del trade letti dal foglio Google (tab "Calendario 2026").
// Ordine di avanzamento: 1ª candela opposta → trigger confermato → chiuso.
export const TRADE_STATES = {
  opposta: {
    label: '1° CANDELA OPPOSTA',
    short: '1ª opp.',
    icon: BellRing,
    badge: 'bg-amber-100 text-amber-700',
    card: 'border-amber-300 shadow-amber-100/60 ring-2 ring-amber-200 hover:shadow-amber-200/40',
    box: 'border-amber-300 bg-amber-50 ring-2 ring-amber-200',
    check: 'border-amber-500 bg-amber-500',
    text: 'text-amber-800',
  },
  trigger: {
    label: 'TRIGGER CONFERMATO',
    short: 'Trigger',
    icon: Zap,
    badge: 'bg-blue-100 text-blue-700',
    card: 'border-blue-400 shadow-blue-100/60 ring-2 ring-blue-200 hover:shadow-blue-200/40',
    box: 'border-blue-300 bg-blue-50 ring-2 ring-blue-200',
    check: 'border-blue-600 bg-blue-600',
    text: 'text-blue-800',
  },
  chiuso: {
    label: 'CHIUSO',
    short: 'Chiuso',
    icon: Lock,
    badge: 'bg-slate-200 text-slate-700',
    card: 'border-slate-400 shadow-slate-100/60 ring-2 ring-slate-200 opacity-80 hover:opacity-100',
    box: 'border-slate-300 bg-slate-100 ring-2 ring-slate-200',
    check: 'border-slate-600 bg-slate-600',
    text: 'text-slate-800',
  },
};

// Stato più avanzato spuntato nel foglio (o null)
export function getTradeState(item) {
  if (item?.tradeChiuso) return 'chiuso';
  if (item?.triggerConfermato) return 'trigger';
  if (item?.primaCandelaOpposta) return 'opposta';
  return null;
}

function isDone(item, key) {
  return key === 'opposta' ? !!item.primaCandelaOpposta : key === 'trigger' ? !!item.triggerConfermato : !!item.tradeChiuso;
}

function description(item, key, done) {
  const candela = item.direzioneRaw === 'LONG' ? 'ribassista' : 'rialzista';
  if (key === 'opposta')
    return done
      ? `Candela daily ${candela} già verificata.`
      : `Spunta nel foglio quando si forma una candela daily ${candela}.`;
  if (key === 'trigger')
    return done ? 'Condizione di ingresso confermata: trade aperto.' : 'In attesa della conferma del trigger.';
  return done ? 'Il trade è stato chiuso.' : 'Trade non ancora chiuso.';
}

// Sezione nella pagina di dettaglio (il nome resta OppositeCandleSection
// così non serve modificare la pagina di dettaglio)
export function OppositeCandleSection({ item }) {
  const current = getTradeState(item);
  return (
    <section>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-violet-700">Stato del trade</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {Object.entries(TRADE_STATES).map(([key, st]) => {
          const done = isDone(item, key);
          const Icon = st.icon;
          const isCurrent = current === key;
          return (
            <div
              key={key}
              className={`flex items-start gap-3 rounded-2xl border p-4 shadow-sm transition ${
                done ? st.box : 'border-violet-100 bg-white'
              } ${done && !isCurrent ? 'opacity-70' : ''}`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 text-white ${
                  done ? st.check : 'border-slate-300 bg-white'
                }`}
              >
                {done && <Check className="h-5 w-5" strokeWidth={3} />}
              </span>
              <span className="flex-1">
                <span className={`flex items-center gap-1.5 text-sm font-bold tracking-wide ${done ? st.text : 'text-slate-900'}`}>
                  {st.label}
                  {done && <Icon className="h-4 w-4" />}
                </span>
                <span className="mt-0.5 block text-xs text-slate-600">{description(item, key, done)}</span>
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        <Sheet className="h-3 w-3" /> Dal foglio Google · Calendario 2026
      </p>
    </section>
  );
}

// Simbolo sulla card della home (mostra lo stato più avanzato)
export function TradeStateBadge({ state }) {
  const st = TRADE_STATES[state];
  if (!st) return null;
  const Icon = st.icon;
  return (
    <span
      title={st.label}
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${st.badge}`}
    >
      <Icon className="h-3 w-3" /> {st.short}
    </span>
  );
}
