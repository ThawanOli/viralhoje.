import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNicheBySlug, type Niche } from '@/lib/niches';
import { getNicheTrendsForToday, todayKey } from '@/lib/trendAggregator';
import { getExploreItemsForNiche } from '@/lib/explore';
import TrendCard from '@/components/TrendCard';
import ExploreCard from '@/components/ExploreCard';
import PlatformTabs, { isValidPlatform, type PlatformId } from '@/components/PlatformTabs';
import BottomNav from '@/components/BottomNav';

export default async function NichePage({
  params,
  searchParams,
}: {
  params: { niche: string };
  searchParams: { plataforma?: string };
}) {
  const niche = getNicheBySlug(params.niche);
  if (!niche) notFound();

  const plataforma: PlatformId = isValidPlatform(searchParams.plataforma) ? searchParams.plataforma : 'youtube';

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

        <header className="mb-5 mt-2">
          <div className="text-3xl">{niche.emoji}</div>
          <h1 className="mt-1 text-2xl font-bold text-white">{niche.nome}</h1>
          <p className="mt-1 text-sm text-white/60">Tendências de hoje, {dataFormatada}</p>
        </header>

        <PlatformTabs nicheSlug={niche.slug} ativa={plataforma} />

        {plataforma === 'youtube' ? (
          <YoutubeSection nicheSlug={niche.slug} />
        ) : (
          <ExploreSection niche={niche} plataforma={plataforma} />
        )}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-white/40">
          Os vídeos exibidos pertencem aos seus respectivos criadores. Baixe e remixe apenas conteúdo
          que você tem direito de reutilizar, respeitando direitos autorais e os Termos de Serviço das
          plataformas.
        </p>
      </div>

      <BottomNav />
    </main>
  );
}

async function YoutubeSection({ nicheSlug }: { nicheSlug: string }) {
  const trends = await getNicheTrendsForToday(nicheSlug);

  if (trends.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
        Não encontramos vídeos em alta para este nicho agora. Tente novamente em alguns minutos — a
        busca por tendências do YouTube pode estar temporariamente indisponível.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {trends.map((trend) => (
        <TrendCard key={trend.id} trend={trend} />
      ))}
    </div>
  );
}

async function ExploreSection({
  niche,
  plataforma,
}: {
  niche: Niche;
  plataforma: 'tiktok' | 'instagram';
}) {
  const items = await getExploreItemsForNiche(niche);
  const nomePlataforma = plataforma === 'tiktok' ? 'TikTok' : 'Instagram';

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/60">
        O {nomePlataforma} não oferece uma API pública de tendências, então aqui mostramos os temas em
        alta de hoje no seu nicho — toque em um deles para ver os vídeos mais virais diretamente no{' '}
        {nomePlataforma}.
      </div>
      {items.map((item, i) => (
        <ExploreCard key={item.keyword} item={item} rank={i + 1} plataforma={plataforma} />
      ))}
    </div>
  );
}
