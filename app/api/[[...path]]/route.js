import { NextResponse } from 'next/server';
import { fetchSeasonalities } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

async function handle(request, { params }) {
  const parts = (await params)?.path || [];
  const path = Array.isArray(parts) ? parts.join('/') : parts || '';

  try {
    if (path === '' || path === 'health') {
      return NextResponse.json({ ok: true, service: 'seasonality-hub' });
    }

    if (path === 'seasonalities') {
      const { searchParams } = new URL(request.url);
      const force = searchParams.get('force') === '1';
      const items = await fetchSeasonalities({ force });
      return NextResponse.json({ ok: true, count: items.length, items });
    }

    if (path.startsWith('seasonalities/')) {
      const id = decodeURIComponent(path.replace('seasonalities/', ''));
      const items = await fetchSeasonalities();
      const item = items.find((x) => x.id === id);
      if (!item) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
      return NextResponse.json({ ok: true, item });
    }

    return NextResponse.json({ ok: false, error: 'unknown_route', path }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || 'internal_error' }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
