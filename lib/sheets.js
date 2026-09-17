// Google Sheets fetcher + parser for the "Diario Trade" tab
// Only reads statistical seasonality data. No trading terminology is exposed.

const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const TAB_NAME = process.env.GOOGLE_SHEETS_TAB_NAME || 'Diario Trade';
const HEADER_ROW = parseInt(process.env.GOOGLE_SHEETS_HEADER_ROW || '3', 10);

// simple in-memory cache to avoid hitting API on every request during dev
let _cache = { at: 0, data: null };
const CACHE_MS = 30 * 1000; // 30s

const normalize = (s) => (s || '').toString().trim().toLowerCase();

// Parse italian number strings like "9,7%", "-4,04%", "275,15" -> Number
export function parseItNumber(v) {
  if (v === null || v === undefined) return null;
  const s = v.toString().trim();
  if (s === '' || s === '-' || s === '∞') return null;
  const cleaned = s.replace('%', '').replace(/\./g, '').replace(',', '.').trim();
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

// Parse period string "25/06/2026 - 02/08/2026" -> {start: Date, end: Date}
export function parsePeriod(str) {
  if (!str) return { start: null, end: null };
  const parts = str.split('-').map((s) => s.trim());
  if (parts.length < 2) return { start: null, end: null };
  const parseDate = (d) => {
    const m = d.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (!m) return null;
    let [, dd, mm, yyyy] = m;
    if (yyyy.length === 2) yyyy = '20' + yyyy;
    const date = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    return isNaN(date.getTime()) ? null : date;
  };
  return { start: parseDate(parts[0]), end: parseDate(parts[1]) };
}

export function computeStatus(start, end, now = new Date()) {
  if (!start || !end) return { status: 'N/D', progress: 0 };
  const t = now.getTime();
  const s = start.getTime();
  const e = end.getTime();
  if (t < s) return { status: 'IN ARRIVO', progress: 0 };
  if (t > e) return { status: 'TERMINATA', progress: 100 };
  const p = ((t - s) / (e - s)) * 100;
  return { status: 'ATTIVA', progress: Math.max(0, Math.min(100, p)) };
}

function mapHeaders(headerRow) {
  // Build an object mapping normalized-header -> column index
  const map = {};
  headerRow.forEach((h, i) => {
    const key = normalize(h);
    if (key) map[key] = i;
  });
  return map;
}

function pick(row, map, keys) {
  for (const k of keys) {
    const idx = map[normalize(k)];
    if (idx !== undefined) {
      const v = row[idx];
      if (v !== undefined && v !== null && v.toString().trim() !== '') return v;
    }
  }
  return null;
}

export async function fetchSeasonalities({ force = false } = {}) {
  if (!force && _cache.data && Date.now() - _cache.at < CACHE_MS) {
    return _cache.data;
  }
  if (!API_KEY || !SPREADSHEET_ID) {
    throw new Error('Missing GOOGLE_SHEETS_API_KEY or GOOGLE_SHEETS_SPREADSHEET_ID env');
  }
  const range = encodeURIComponent(`${TAB_NAME}!A1:BA2000`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Google Sheets API error: ${res.status} ${t}`);
  }
  const json = await res.json();
  const values = json.values || [];
  if (values.length < HEADER_ROW) return [];
  const headerRow = values[HEADER_ROW - 1] || [];
  const map = mapHeaders(headerRow);
  const dataRows = values.slice(HEADER_ROW);

  const items = [];
  for (const row of dataRows) {
    const asset = pick(row, map, ['Asset']);
    const periodo = pick(row, map, ['Periodo stagionale', 'Periodo']);
    if (!asset || !periodo) continue;

    const id = pick(row, map, ['ID']);
    const direzioneRaw = (pick(row, map, ['Direzione']) || '').toString().toUpperCase();
    const direzione =
      direzioneRaw === 'LONG' ? 'Rialzista' : direzioneRaw === 'SHORT' ? 'Ribassista' : direzioneRaw || 'N/D';
    const classe = pick(row, map, ['Classe']);
    const avgMedio = parseItNumber(pick(row, map, ['AVG Medio']));
    const wr10 = parseItNumber(pick(row, map, ['WR 10Y']));
    const wr20 = parseItNumber(pick(row, map, ['WR 20Y']));
    const avg10 = parseItNumber(pick(row, map, ['AVG 10Y']));
    const avg20 = parseItNumber(pick(row, map, ['AVG 20Y']));
    const avgOpp = parseItNumber(pick(row, map, ['AVG Opposto']));
    const ddMedio = parseItNumber(pick(row, map, ['DD Medio']));
    const ddMax = parseItNumber(pick(row, map, ['DD Max']));
    const score = parseItNumber(pick(row, map, ['SCORE']));
    const priorita = pick(row, map, ['PRIORITÀ', 'PRIORITA', 'Priorita', 'Priorità']);

    const { start, end } = parsePeriod(periodo);
    const { status, progress } = computeStatus(start, end);

    items.push({
      id: id ? id.toString() : `${asset}-${periodo}`.replace(/\s+/g, '_'),
      asset,
      periodo,
      periodoStart: start ? start.toISOString() : null,
      periodoEnd: end ? end.toISOString() : null,
      direzione,
      direzioneRaw,
      classe: classe || null,
      avgMedio,
      wr10,
      wr20,
      avg10,
      avg20,
      avgOpposto: avgOpp,
      ddMedio,
      ddMax,
      score,
      priorita: priorita || null,
      status,
      progress,
    });
  }

  // Order by statistical reliability (score desc, then WR 20Y desc)
  items.sort((a, b) => {
    const sa = a.score ?? -1;
    const sb = b.score ?? -1;
    if (sb !== sa) return sb - sa;
    return (b.wr20 ?? -1) - (a.wr20 ?? -1);
  });

  _cache = { at: Date.now(), data: items };
  return items;
}
