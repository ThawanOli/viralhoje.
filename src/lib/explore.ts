import type { Niche } from './niches';
import { prisma } from './prisma';
import { todayKey } from './trendAggregator';

export type ExploreItem = {
  keyword: string;
  hashtag: string;
  tiktokSearchUrl: string;
  tiktokHashtagUrl: string;
  instagramSearchUrl: string;
  instagramHashtagUrl: string;
};

function toHashtag(keyword: string): string {
  return keyword
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function buildItem(keyword: string): ExploreItem {
  const hashtag = toHashtag(keyword);
  const q = encodeURIComponent(keyword);
  return {
    keyword,
    hashtag,
    tiktokSearchUrl: `https://www.tiktok.com/search?q=${q}`,
    tiktokHashtagUrl: `https://www.tiktok.com/tag/${hashtag}`,
    instagramSearchUrl: `https://www.instagram.com/explore/search/keyword/?q=${q}`,
    instagramHashtagUrl: `https://www.instagram.com/explore/tags/${hashtag}/`,
  };
}

// Monta a lista de tendências "exploráveis" do dia para TikTok/Instagram:
// junta as palavras-chave que geraram o ranking de hoje no YouTube (que já vêm
// do cruzamento com o Google Trends) com as palavras-semente do nicho.
export async function getExploreItemsForNiche(niche: Niche, limite = 10): Promise<ExploreItem[]> {
  const date = todayKey();
  const trends = await prisma.dailyTrend.findMany({
    where: { niche: niche.slug, date },
    orderBy: { rank: 'asc' },
    select: { keyword: true },
  });

  const doDia = trends.map((t) => t.keyword);
  const unicos = [...new Set([...doDia, ...niche.keywords])];
  return unicos.slice(0, limite).map(buildItem);
}
