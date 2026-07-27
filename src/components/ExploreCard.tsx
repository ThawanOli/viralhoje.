import type { ExploreItem } from '@/lib/explore';

// Cores da identidade visual do Instagram.
const COR_DE = '#833AB4';
const COR_PARA = '#FD1D1D';

export default function ExploreCard({ item, rank }: { item: ExploreItem; rank: number }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${COR_DE}, ${COR_PARA})` }}
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
          href={item.instagramSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-full px-3 py-2 text-center text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${COR_DE}, ${COR_PARA})` }}
        >
          Ver virais no Instagram
        </a>
        <a
          href={item.instagramHashtagUrl}
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
