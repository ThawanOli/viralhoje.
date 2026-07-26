import { prisma } from './prisma';
import { getNicheBySlug, NICHES } from './niches';
import { getDailyTrendsBR, buildSearchQueriesForNiche } from './googleTrends';
import { searchTopVideos, type YoutubeVideo } from './youtube';
import { computeViralScore, formatoDoVideo, porqueViralizou } from './viralScore';

const TOP_N = 10;

export function todayKey(): string {
  // Data no fuso de São Paulo, formato YYYY-MM-DD.
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

async function fetchAndRankVideos(nicheSlug: string): Promise<YoutubeVideo[]> {
  const niche = getNicheBySlug(nicheSlug);
  if (!niche) throw new Error(`Nicho inválido: ${nicheSlug}`);

  const topics = await getDailyTrendsBR();
  const queries = buildSearchQueriesForNiche(topics, niche);

  const resultados = await Promise.allSettled(queries.map((q) => searchTopVideos(q, { maxResults: 6 })));
  const todosVideos = resultados.flatMap((r) => {
    if (r.status === 'fulfilled') return r.value;
    console.error('[trendAggregator] busca no YouTube falhou para uma query:', r.reason);
    return [];
  });

  const porId = new Map<string, YoutubeVideo>();
  for (const v of todosVideos) {
    if (!porId.has(v.videoId)) porId.set(v.videoId, v);
  }

  const unicos = [...porId.values()];
  unicos.sort((a, b) => computeViralScore(b) - computeViralScore(a));
  return unicos.slice(0, TOP_N);
}

// Recalcula e grava no banco as top 10 tendências do dia para um nicho.
// Idempotente: pode ser chamado várias vezes no mesmo dia sem duplicar linhas.
export async function refreshNicheTrends(nicheSlug: string): Promise<void> {
  const date = todayKey();
  const videos = await fetchAndRankVideos(nicheSlug);

  await prisma.$transaction(
    videos.map((video, index) => {
      const formato = formatoDoVideo(video.duracaoIso);
      const score = computeViralScore(video);
      const rank = index + 1;
      return prisma.dailyTrend.upsert({
        where: { niche_date_rank: { niche: nicheSlug, date, rank } },
        create: {
          niche: nicheSlug,
          date,
          rank,
          keyword: video.origemQuery,
          formato,
          viralScore: score,
          porqueViralizou: porqueViralizou(video, score, formato),
          videoId: video.videoId,
          videoTitle: video.titulo,
          videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
          channelName: video.canal,
          thumbnailUrl: video.thumbnailUrl,
          views: video.visualizacoes,
          likes: video.curtidas,
          comments: video.comentarios,
          publishedAt: new Date(video.publicadoEm),
        },
        update: {
          keyword: video.origemQuery,
          formato,
          viralScore: score,
          porqueViralizou: porqueViralizou(video, score, formato),
          videoId: video.videoId,
          videoTitle: video.titulo,
          videoUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
          channelName: video.canal,
          thumbnailUrl: video.thumbnailUrl,
          views: video.visualizacoes,
          likes: video.curtidas,
          comments: video.comentarios,
          publishedAt: new Date(video.publicadoEm),
        },
      });
    })
  );
}

export async function refreshAllNiches(): Promise<{ niche: string; ok: boolean; error?: string }[]> {
  const resultados = [];
  for (const niche of NICHES) {
    try {
      await refreshNicheTrends(niche.slug);
      resultados.push({ niche: niche.slug, ok: true });
    } catch (err) {
      resultados.push({ niche: niche.slug, ok: false, error: String(err) });
    }
  }
  return resultados;
}

export async function getNicheTrendsForToday(nicheSlug: string) {
  const date = todayKey();
  let trends = await prisma.dailyTrend.findMany({
    where: { niche: nicheSlug, date },
    orderBy: { rank: 'asc' },
  });

  if (trends.length === 0) {
    try {
      await refreshNicheTrends(nicheSlug);
      trends = await prisma.dailyTrend.findMany({
        where: { niche: nicheSlug, date },
        orderBy: { rank: 'asc' },
      });
    } catch (err) {
      console.error('[trendAggregator] falha ao atualizar tendências do nicho', nicheSlug, err);
    }
  }

  return trends;
}
