import { NextRequest, NextResponse } from 'next/server';
import { refreshAllNiches } from '@/lib/trendAggregator';

// Endpoint para ser chamado 1x por dia por um agendador externo (Render Cron Job,
// cron-job.org, GitHub Actions schedule, etc). Protegido por um token secreto
// enviado no header x-cron-secret, configurado em CRON_SECRET no .env.
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const resultados = await refreshAllNiches();
  return NextResponse.json({ ok: true, resultados });
}
