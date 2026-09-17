# Seasonality Hub

Web app **responsive** per visualizzare stagionalità finanziarie provenienti da un Google Sheet.

> ⚠️ **Non è una piattaforma di segnali di trading.** L'app mostra esclusivamente **analisi statistiche di stagionalità storiche** basate sui dati salvati nel tuo foglio di calcolo. Lo score rappresenta un **indice statistico storico** e **non una probabilità futura**.

## Stack

- **Next.js 15** (App Router)
- **React 18** + JavaScript (facilmente migrabile a TypeScript)
- **Tailwind CSS**
- **Google Sheets API v4** (via API Key + sheet pubblico)
- Deploy: **Vercel** (nessun database esterno richiesto)

## Pagine

- `/` — **Home**: lista stagionalità ordinate per affidabilità statistica (score desc). Filtri per stato, classe, ricerca asset.
- `/dettaglio/[id]` — **Dettaglio**: score grande, classe, periodo, avanzamento, tutte le metriche statistiche (WR 10Y/20Y, Avg 10Y/20Y, Avg Return, Movimento Opposto, DD Medio, DD Max).
- `/calendario` — **Calendario**: stagionalità raggruppate per mese in ordine cronologico.

## Stati automatici

Lo stato di ogni stagionalità è calcolato in base alla data corrente confrontata col periodo:

| Stato        | Condizione                              |
|--------------|-----------------------------------------|
| `IN ARRIVO`  | data odierna **prima** della data inizio |
| `ATTIVA`     | data odierna **compresa** nel periodo    |
| `TERMINATA`  | data odierna **dopo** la data fine       |

La barra di avanzamento periodo mostra la % di tempo trascorso all'interno del periodo stagionale.

## Struttura del Google Sheet

L'app legge il tab **"Diario Trade"** (configurabile via env). Gli header devono trovarsi sulla **riga 3** (configurabile), i dati partono dalla **riga 4**.

Colonne lette (i nomi degli header sono cercati per corrispondenza case-insensitive):

| Header nello Sheet   | Significato                                    |
|----------------------|------------------------------------------------|
| `ID`                 | Identificativo univoco della stagionalità      |
| `Asset`              | Nome/ticker asset (es. SUGAR, AAPL, Gold)      |
| `Periodo stagionale` | Formato `DD/MM/YYYY - DD/MM/YYYY`              |
| `Direzione`          | `LONG` → "Rialzista", `SHORT` → "Ribassista"   |
| `AVG Medio`          | Ritorno medio storico (%)                      |
| `WR 10Y`             | Win rate 10 anni (%)                           |
| `WR 20Y`             | Win rate 20 anni (%)                           |
| `AVG 10Y`            | Ritorno medio 10 anni (%)                      |
| `AVG 20Y`            | Ritorno medio 20 anni (%)                      |
| `AVG Opposto`        | Movimento medio opposto (%)                    |
| `DD Medio`           | Drawdown medio (%)                             |
| `DD Max`             | Drawdown massimo (%)                           |
| `SCORE`              | Affidabilità statistica (0-100)                |
| `PRIORITÀ`           | Etichetta priorità (opzionale)                 |
| `Classe`             | S / A+ / A / B / C (opzionale)                 |

Tutti i numeri devono essere in **formato italiano** (virgola come separatore decimale, `%` opzionale).

## Come collegare Google Sheets (istruzioni complete)

### 1. Rendi pubblico il tuo Google Sheet
1. Apri il tuo Google Sheet
2. Clicca **"Condividi"** in alto a destra
3. In **"Accesso generale"** seleziona **"Chiunque abbia il link"** → **"Visualizzatore"**
4. Salva

### 2. Ottieni una API Key di Google
1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto (o selezionane uno esistente)
3. Menu → **"APIs & Services"** → **"Library"** → cerca **"Google Sheets API"** → clicca **"Enable"**
4. Menu → **"APIs & Services"** → **"Credentials"** → **"+ Create Credentials"** → **"API key"**
5. Copia la chiave (formato `AIzaSy...`)
6. **Consigliato**: clicca sulla chiave appena creata → **"API restrictions"** → limita a **"Google Sheets API"**

### 3. Configura le variabili d'ambiente
Copia `.env.example` in `.env` e compila:

```env
GOOGLE_SHEETS_API_KEY=AIzaSy...tuachiave
GOOGLE_SHEETS_SPREADSHEET_ID=1LvilmqTT3bXKJYI1_uYZ-tR4vnytffLGAHHMi9I_kHM
GOOGLE_SHEETS_TAB_NAME=Diario Trade
GOOGLE_SHEETS_HEADER_ROW=3
```

Lo **Spreadsheet ID** lo trovi nell'URL dello sheet:
`https://docs.google.com/spreadsheets/d/`**`<QUESTA È L'ID>`**`/edit`

## Sviluppo locale

```bash
# 1. Installa dipendenze
yarn install

# 2. Configura env
cp .env.example .env
# poi modifica .env con le tue credenziali

# 3. Avvia in dev
yarn dev
# → http://localhost:3000
```

## Deploy su Vercel

### Opzione A — Deploy da GitHub
1. Pusha il progetto su un repo GitHub
2. Vai su [vercel.com/new](https://vercel.com/new)
3. Importa il repository
4. In **"Environment Variables"** aggiungi le 4 variabili:
   - `GOOGLE_SHEETS_API_KEY`
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SHEETS_TAB_NAME`
   - `GOOGLE_SHEETS_HEADER_ROW`
5. Clicca **Deploy**

### Opzione B — Deploy via CLI
```bash
npm i -g vercel
vercel login
vercel        # primo deploy (preview)
vercel --prod # deploy in produzione
```

Poi imposta le env vars con:
```bash
vercel env add GOOGLE_SHEETS_API_KEY
vercel env add GOOGLE_SHEETS_SPREADSHEET_ID
vercel env add GOOGLE_SHEETS_TAB_NAME
vercel env add GOOGLE_SHEETS_HEADER_ROW
```

## Struttura del progetto

```
/app
├── app/
│   ├── layout.js               # Layout globale + header + footer con disclaimer
│   ├── page.js                 # Home (lista + filtri + hero)
│   ├── globals.css             # Tailwind + tokens design
│   ├── dettaglio/[id]/page.js  # Pagina dettaglio
│   ├── calendario/page.js      # Pagina calendario
│   └── api/[[...path]]/route.js # API proxy verso Google Sheets
├── lib/
│   ├── sheets.js               # Fetch + parser dello Sheet
│   └── format.js               # Helper formattazione IT
├── .env.example
└── README.md
```

## API endpoints (interni)

- `GET /api/health` — health check
- `GET /api/seasonalities` — lista completa (ordinata per score desc). Aggiungi `?force=1` per bypassare la cache di 30s
- `GET /api/seasonalities/<id>` — singola stagionalità

## Note sul linguaggio

L'app **non usa termini come**: segnali, trade, entry, stop loss, take profit, compra o vendi.
Le direzioni `LONG`/`SHORT` presenti nello Sheet vengono mappate in **"Rialzista"** / **"Ribassista"** nell'interfaccia.

## Formato italiano

Date e numeri sono formattati in italiano (`it-IT`):
- Date: `25/06/2026`
- Percentuali: `9,7%`
- Decimali: `12,3`

## Disclaimer

Lo score e le metriche mostrate rappresentano un **indice statistico basato su dati storici** e **non costituiscono in alcun modo** una probabilità futura, una previsione o un consiglio finanziario. Questa piattaforma non fornisce segnali di trading e non deve essere utilizzata per prendere decisioni di investimento.
