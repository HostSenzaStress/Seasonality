// Italian number and date formatting helpers
export function formatPct(n, digits = 1) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return `${n.toLocaleString('it-IT', { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

export function formatNum(n, digits = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toLocaleString('it-IT', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatDateIt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateItShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
}

export function statusColor(status) {
  switch (status) {
    case 'ATTIVA':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'IN ARRIVO':
      return 'bg-violet-100 text-violet-700 border-violet-200';
    case 'TERMINATA':
      return 'bg-slate-100 text-slate-500 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-500 border-slate-200';
  }
}

export function classeColor(c) {
  const k = (c || '').toString().toUpperCase();
  if (k === 'S') return 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white';
  if (k === 'A+') return 'bg-violet-600 text-white';
  if (k === 'A') return 'bg-violet-500 text-white';
  if (k === 'B') return 'bg-violet-300 text-violet-900';
  if (k === 'C') return 'bg-slate-200 text-slate-700';
  return 'bg-slate-100 text-slate-700';
}
