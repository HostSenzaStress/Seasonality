🎉 **Widget TradingView funzionante!** Vedi il grafico di **Sugar No. 11 CFD** su FOREXCOM in timeframe **1D (Daily)**, tema light coerente col design viola/bianco, locale italiano ("Aper.", "Max.", "Min.", "Chius.", "Tutto"). Il widget è cliccabile: puoi cambiare timeframe, aggiungere indicatori, cercare altri simboli.

## ✅ Riepilogo modifiche

Ho aggiunto/modificato **3 file**:

| File | Cosa |
|---|---|
| `components/TradingViewWidget.jsx` | **NUOVO** — componente client-side che carica lo script ufficiale TradingView con `autosize`, `interval: 'D'`, `theme: 'light'`, `locale: 'it'` |
| `app/dettaglio/[id]/page.js` | Import del widget + nuova sezione "GRAFICO — [asset]" con badge "Timeframe Daily", posizionata subito **sotto le metriche statistiche** e **sopra il disclaimer** |
| `lib/sheets.js` | Aggiunto supporto opzionale al campo `Ticker` (o `TICKER`/`Simbolo`/`Symbol`) dal Google Sheet, con fallback su `Asset` |

## 📤 Come portare le modifiche su GitHub/Vercel

Su GitHub crea/aggiorna questi 3 file (Add file → Create new file / edit):

### 1. Nuovo file: `components/TradingViewWidget.jsx`
Su GitHub → Add file → Create new file → nome: `components/TradingViewWidget.jsx` → contenuto:

```jsx
'use client';

import { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol }) {
  const container = useRef(null);
  const loadedFor = useRef(null);

  useEffect(() => {
    if (!container.current || !symbol) return;
    if (loadedFor.current === symbol) return;
    loadedFor.current = symbol;

    container.current.innerHTML = '';

    const inner = document.createElement('div');
    inner.className = 'tradingview-widget-container__widget';
    inner.style.height = '100%';
    inner.style.width = '100%';
    container.current.appendChild(inner);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Europe/Rome',
      theme: 'light',
      style: '1',
      locale: 'it',
      allow_symbol_change: true,
      hide_side_toolbar: false,
      withdateranges: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div
      ref={container}
      className="tradingview-widget-container"
      style={{ height: '520px', width: '100%' }}
    />
  );
}

export default memo(TradingViewWidget);
```

### 2. Aggiorna `app/dettaglio/[id]/page.js`
Su GitHub apri il file → clicca l'icona **matita** (Edit) → sostituisci **tutto il contenuto** con questo:
Action: view_file({"path":"/app/app/dettaglio/[id]/page.js"})
Observation: [Showing lines 1-217 of 217 total] /app/app/dettaglio/[id]/page.js:
1|'use client';
2|
3|import { useEffect, useState, use } from 'react';
4|import Link from 'next/link';
5|import { ArrowLeft, TrendingUp, TrendingDown, Info, Sparkles, LineChart } from 'lucide-react';
6|import { formatPct, formatDateIt, statusColor, classeColor } from '@/lib/format';
7|import TradingViewWidget from '@/components/TradingViewWidget';
8|
9|function BigScore({ value }) {
10|  const v = Math.max(0, Math.min(100, value ?? 0));
11|  const stroke = 14;
12|  const size = 200;
13|  const r = (size - stroke) / 2;
14|  const c = 2 * Math.PI * r;
15|  const dash = (v / 100) * c;
16|  return (
17|    <div className="relative flex h-[200px] w-[200px] items-center justify-center">
18|      <svg width={size} height={size} className="-rotate-90">
19|        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-violet-100" fill="none" />
20|        <circle
21|          cx={size / 2}
22|          cy={size / 2}
23|          r={r}
24|          strokeWidth={stroke}
25|          strokeLinecap="round"
26|          strokeDasharray={`${dash} ${c}`}
27|          className="stroke-[url(#big)]"
28|          fill="none"
29|        />
30|        <defs>
31|          <linearGradient id="big" x1="0" y1="0" x2="1" y2="1">
32|            <stop offset="0%" stopColor="#7c3aed" />
33|            <stop offset="100%" stopColor="#d946ef" />
34|          </linearGradient>
35|        </defs>
36|      </svg>
37|      <div className="absolute flex flex-col items-center">
38|        <span className="text-5xl font-black tracking-tight text-slate-900">{v}</span>
39|        <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-violet-600">Score</span>
40|      </div>
41|    </div>
42|  );
43|}
44|
45|function MetricBig({ label, value, tone }) {
46|  const toneCls =
47|    tone === 'good'
48|      ? 'text-emerald-600'
49|      : tone === 'bad'
50|      ? 'text-rose-600'
51|      : 'text-slate-900';
52|  return (
53|    <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
54|      <div className="text-[10px] font-semibold uppercase tracking-widest text-violet-600">{label}</div>
55|      <div className={`mt-1 text-2xl font-bold ${toneCls}`}>{value}</div>
56|    </div>
57|  );
58|}
59|
60|export default function DetailPage({ params }) {
61|  const { id } = use(params);
62|  const [item, setItem] = useState(null);
63|  const [error, setError] = useState(null);
64|
65|  useEffect(() => {
66|    (async () => {
67|      try {
68|        const r = await fetch(`/api/seasonalities/${encodeURIComponent(id)}`);
69|        const j = await r.json();
70|        if (!j.ok) throw new Error(j.error || 'errore');
71|        setItem(j.item);
72|      } catch (e) {
73|        setError(e.message);
74|      }
75|    })();
76|  }, [id]);
77|
78|  if (error) {
79|    return (
80|      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
81|        <p className="font-semibold text-rose-700">Impossibile caricare la stagionalità.</p>
82|        <p className="mt-1 text-xs text-rose-600">{error}</p>
83|        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-violet-700 hover:underline">
84|          ← Torna alla home
85|        </Link>
86|      </div>
87|    );
88|  }
89|
90|  if (!item) {
91|    return <div className="h-96 animate-pulse rounded-3xl border border-violet-100 bg-white/60" />;
92|  }
93|
94|  const isUp = item.direzioneRaw === 'LONG';
95|
96|  return (
97|    <div className="space-y-6">
98|      <Link
99|        href="/"
100|        className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:underline"
101|      >
102|        <ArrowLeft className="h-4 w-4" /> Torna alla lista
103|      </Link>
104|
105|      {/* Hero card */}
106|      <section className="grid grid-cols-1 gap-6 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[220px,1fr]">
107|        <div className="flex items-center justify-center">
108|          <BigScore value={item.score} />
109|        </div>
110|        <div className="flex flex-col justify-center">
111|          <div className="flex flex-wrap items-center gap-2">
112|            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{item.asset}</h1>
113|            {item.classe && (
114|              <span className={`rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider ${classeColor(item.classe)}`}>
115|                Classe {item.classe}
116|              </span>
117|            )}
118|            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${statusColor(item.status)}`}>
119|              {item.status}
120|            </span>
121|          </div>
122|          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
123|            {isUp ? (
124|              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
125|                <TrendingUp className="h-4 w-4" /> Direzione stagionale rialzista
126|              </span>
127|            ) : (
128|              <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
129|                <TrendingDown className="h-4 w-4" /> Direzione stagionale ribassista
130|              </span>
131|            )}
132|            <span className="text-slate-300">•</span>
133|            <span>
134|              {formatDateIt(item.periodoStart)} — {formatDateIt(item.periodoEnd)}
135|            </span>
136|          </div>
137|
138|          {/* Progress */}
139|          <div className="mt-5">
140|            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-600">
141|              <span>Avanzamento periodo</span>
142|              <span>{Math.round(item.progress)}%</span>
143|            </div>
144|            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
145|              <div
146|                className={`h-full rounded-full ${
147|                  item.status === 'ATTIVA'
148|                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
149|                    : item.status === 'TERMINATA'
150|                    ? 'bg-slate-300'
151|                    : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'
152|                }`}
153|                style={{ width: `${item.progress}%` }}
154|              />
155|            </div>
156|          </div>
157|
158|          <div className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
159|            <Sparkles className="h-3.5 w-3.5" /> Affidabilità statistica: indice storico
160|          </div>
161|        </div>
162|      </section>
163|
164|      {/* Statistical metrics */}
165|      <section>
166|        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-violet-700">Metriche statistiche storiche</h2>
167|        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
168|          <MetricBig label="Win Rate 10 anni" value={formatPct(item.wr10, 0)} tone="good" />
169|          <MetricBig label="Win Rate 20 anni" value={formatPct(item.wr20, 0)} tone="good" />
170|          <MetricBig label="Avg Return medio" value={formatPct(item.avgMedio)} />
171|          <MetricBig label="Avg 10 anni" value={formatPct(item.avg10)} />
172|          <MetricBig label="Avg 20 anni" value={formatPct(item.avg20)} />
173|          <MetricBig label="Movimento opposto" value={formatPct(item.avgOpposto)} tone="bad" />
174|          <MetricBig label="Drawdown medio" value={formatPct(item.ddMedio)} tone="bad" />
175|          <MetricBig label="Drawdown massimo" value={formatPct(item.ddMax)} tone="bad" />
176|        </div>
177|      </section>
178|
179|      {/* TradingView chart */}
180|      <section>
181|        <div className="mb-3 flex items-center justify-between">
182|          <h2 className="text-sm font-bold uppercase tracking-widest text-violet-700">
183|            Grafico &mdash; {item.asset}
184|          </h2>
185|          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-violet-700">
186|            <LineChart className="h-3.5 w-3.5" /> Timeframe Daily
187|          </span>
188|        </div>
189|        <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white p-2 shadow-sm">
190|          <TradingViewWidget symbol={item.ticker || item.asset} />
191|        </div>
192|        <p className="mt-2 text-[11px] text-slate-500">
193|          Grafico fornito da TradingView. Se il simbolo non viene riconosciuto automaticamente,
194|          usa la barra di ricerca del widget per selezionare l&apos;asset corretto.
195|        </p>
196|      </section>
197|
198|      {/* Disclaimer */}
199|      <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5">
200|        <div className="flex items-start gap-3">
201|          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
202|            <Info className="h-4 w-4" />
203|          </div>
204|          <div>
205|            <p className="text-sm font-bold text-slate-900">Cosa rappresenta lo score?</p>
206|            <p className="mt-1 text-xs leading-relaxed text-slate-600">
207|              Lo score da 1 a 100 è un <strong>indice statistico calcolato sui dati storici</strong> del comportamento
208|              stagionale dell'asset. <strong>Non rappresenta una probabilità futura</strong>, non è una previsione e non
209|              costituisce alcun tipo di consiglio finanziario o operativo.
210|            </p>
211|          </div>
212|        </div>
213|      </section>
214|    </div>
215|  );
216|}
217|
[End of file]
