import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getNicheBySlug } from '@/lib/niches';
import { getNicheTrendsForToday } from '@/lib/trendAggregator';

export async function GET(_req: NextRequest, { params }: { params: { niche: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const niche = getNicheBySlug(params.niche);
  if (!niche) return NextResponse.json({ error: 'Nicho inválido' }, { status: 404 });

  const trends = await getNicheTrendsForToday(niche.slug);
  return NextResponse.json({ niche: niche.slug, trends });
}
