import type { DailyTrend } from '@prisma/client';

export default function TrendCard({ trend }: { trend: DailyTrend }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="relative">
        <img src={trend.thumbnailUrl} alt={trend.videoTitle} className="aspect-video w-full object-cover" />
        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white">
          #{trend.rank}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-brand-gradient px-2 py-1 text-xs font-bold text-white">
          Score {trend.viralScore}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{trend.videoTitle}</h3>
        <p className="mt-1 text-xs text-white/50">{trend.channelName}</p>

        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/10 px-2 py-1 text-white/80">{trend.formato}</span>
          <span className="rounded-full bg-white/10 px-2 py-1 text-white/80">
            {trend.views.toLocaleString('pt-BR')} views
          </span>
          <span className="rounded-full bg-white/10 px-2 py-1 text-white/80">"{trend.keyword}"</span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-white/70">{trend.porqueViralizou}</p>

        <a
          href={trend.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 block rounded-full bg-brand-gradient px-3 py-2 text-center text-xs font-bold text-white"
        >
          Assistir e baixar no YouTube
        </a>
        <p className="mt-2 text-center text-[11px] text-white/40">
          Abre o vídeo no app/site do YouTube — use a opção de download offline dele para remixar.
        </p>
      </div>
    </article>
  );
}
