'use client';

import { BellRing, Check, Sheet } from 'lucide-react';

// Sezione "1° candela opposta" (pagina di dettaglio).
// Il valore arriva dal foglio Google: tab "Calendario 2026", colonna H.
export function OppositeCandleSection({ item }) {
  const checked = !!item.primaCandelaOpposta;
  const candela = item.direzioneRaw === 'LONG' ? 'ribassista' : 'rialzista';

  return (
    <section>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-violet-700">Condizione di ingresso</h2>
      <div
        className={`flex items-center gap-4 rounded-2xl border p-5 shadow-sm ${
          checked ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-200' : 'border-violet-100 bg-white'
        }`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 ${
            checked ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 bg-white'
          }`}
        >
          {checked && <Check className="h-5 w-5" strokeWidth={3} />}
        </span>
        <span className="flex-1">
          <span className={`block text-base font-bold tracking-wide ${checked ? 'text-amber-800' : 'text-slate-900'}`}>
            1° CANDELA OPPOSTA
          </span>
          <span className="mt-0.5 block text-xs text-slate-600">
            {checked
              ? `Candela daily ${candela} già verificata: in attesa della 2ª per il trigger.`
              : `Non ancora verificata. Spunta la casella nel foglio Google quando si forma una candela daily ${candela}.`}
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
            <Sheet className="h-3 w-3" /> Dal foglio Google · Calendario 2026
          </span>
        </span>
        {checked && <BellRing className="h-6 w-6 shrink-0 text-amber-500" />}
      </div>
    </section>
  );
}

// Simbolo mostrato sulla card della home
export function OppositeCandleBadge() {
  return (
    <span
      title="1° candela opposta verificata"
      className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700"
    >
      <BellRing className="h-3 w-3" /> 1ª opp.
    </span>
  );
}
