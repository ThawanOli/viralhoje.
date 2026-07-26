import type { ExploreItem } from '@/lib/explore';

type Plataforma = 'tiktok' | 'instagram';

const LABELS: Record<Plataforma, { nome: string; corDe: string; corPara: string }> = {
  tiktok: { nome: 'TikTok', corDe: '#25F4EE', corPara: '#FE2C55' },
  instagram: { nome: 'Instagram', corDe: '#833AB4', corPara: '#FD1D1D' },
};

export default function ExploreCard({
  item,
  rank,
  plataforma,
}: {
  item: ExploreItem;
  rank: number;
  plataforma: Plataforma;
}) {
  const label = LABELS[plataforma];
  const searchUrl = plataforma === 'tiktok' ? item.tiktokSearchUrl : item.instagramSearchUrl;
  const hashtagUrl = plataforma === 'tiktok' ? item.tiktokHashtagUrl : item.instagramHashtagUrl;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${label.corDe}, ${label.corPara})` }}
        >
          #{rank}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">{item.keyword}</h3>
          <p className="text-xs text-white/50">#{item.hashtag}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full px-3 py-2 text-center text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${label.corDe}, ${label.corPara})` }}
        >
          Ver virais no {label.nome}
        </a>
        <a
          href={hashtagUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full border border-white/20 px-3 py-2 text-center text-xs font-semibold text-white"
        >
          Ver hashtag
        </a>
      </div>
    </article>
  );
}
