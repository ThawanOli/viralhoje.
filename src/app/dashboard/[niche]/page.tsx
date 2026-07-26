import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNicheBySlug } from '@/lib/niches';
import { getNicheTrendsForToday, todayKey } from '@/lib/trendAggregator';
import TrendCard from '@/components/TrendCard';
import BottomNav from '@/components/BottomNav';

export default async function NichePage({ params }: { params: { niche: string } }) {
  const niche = getNicheBySlug(params.niche);
  if (!niche) notFound();

  const trends = await getNicheTrendsForToday(niche.slug);
  const dataFormatada = new Date(`${todayKey()}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });

  return (
    <main className="min-h-screen bg-brand-dark pb-24">
      <div className="mx-auto max-w-md px-6 py-8">
        <Link href="/dashboard" className="text-sm text-white/60">
          ← Nichos
        </Link>

        <header className="mb-6 mt-2">
          <div className="text-3xl">{niche.emoji}</div>
          <h1 className="mt-1 text-2xl font-bold text-white">{niche.nome}</h1>
          <p className="mt-1 text-sm text-white/60">Top 10 tendências de hoje, {dataFormatada}</p>
        </header>

        {trends.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
            Não encontramos vídeos em alta para este nicho agora. Tente novamente em alguns minutos —
            a busca por tendências do YouTube pode estar temporariamente indisponível.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {trends.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-white/40">
          Os vídeos exibidos pertencem aos seus respectivos criadores no YouTube. Baixe e remixe apenas
          conteúdo que você tem direito de reutilizar, respeitando direitos autorais e os Termos de
          Serviço das plataformas.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}
