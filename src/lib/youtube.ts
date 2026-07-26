export type YoutubeVideo = {
  videoId: string;
  titulo: string;
  canal: string;
  thumbnailUrl: string;
  publicadoEm: string;
  duracaoIso: string;
  visualizacoes: number;
  curtidas: number;
  comentarios: number;
  origemQuery: string;
};

import { getGoogleAccessToken, hasServiceAccountCredentials } from './googleServiceAuth';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Suporta dois jeitos de autenticar na YouTube Data API v3:
// 1) Chave de API simples (YOUTUBE_API_KEY) — o caminho padrão, mais simples.
// 2) Conta de serviço do Google Cloud (quando a organização do usuário bloqueia
//    a criação de "API keys" e só permite contas de serviço).
async function authorizeUrl(url: URL): Promise<{ url: URL; headers: HeadersInit }> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    url.searchParams.set('key', apiKey);
    return { url, headers: {} };
  }
  if (hasServiceAccountCredentials()) {
    const token = await getGoogleAccessToken();
    return { url, headers: { Authorization: `Bearer ${token}` } };
  }
  throw new Error(
    'Nenhuma credencial do YouTube configurada: defina YOUTUBE_API_KEY ou GOOGLE_SERVICE_ACCOUNT_EMAIL/GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY no .env'
  );
}

function publishedAfterISO(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString();
}

// Busca vídeos públicos em alta relacionados a uma consulta, ordenados por número de visualizações,
// usando exclusivamente a YouTube Data API v3 oficial (respeitando quota e Termos de Serviço do Google).
export async function searchTopVideos(query: string, opts?: { maxResults?: number; janelaDias?: number }): Promise<YoutubeVideo[]> {
  const maxResults = opts?.maxResults ?? 6;
  const janelaDias = opts?.janelaDias ?? 14;

  const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('order', 'viewCount');
  searchUrl.searchParams.set('regionCode', 'BR');
  searchUrl.searchParams.set('relevanceLanguage', 'pt');
  searchUrl.searchParams.set('publishedAfter', publishedAfterISO(janelaDias));
  searchUrl.searchParams.set('maxResults', String(maxResults));

  const searchAuth = await authorizeUrl(searchUrl);
  const searchRes = await fetch(searchAuth.url.toString(), { headers: searchAuth.headers, next: { revalidate: 0 } });
  if (!searchRes.ok) {
    console.error('[youtube] busca falhou', await searchRes.text());
    return [];
  }
  const searchData = await searchRes.json();
  const videoIds: string[] = (searchData.items ?? [])
    .map((item: any) => item.id?.videoId)
    .filter(Boolean);

  if (videoIds.length === 0) return [];

  const videosUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
  videosUrl.searchParams.set('part', 'snippet,statistics,contentDetails');
  videosUrl.searchParams.set('id', videoIds.join(','));

  const videosAuth = await authorizeUrl(videosUrl);
  const videosRes = await fetch(videosAuth.url.toString(), { headers: videosAuth.headers, next: { revalidate: 0 } });
  if (!videosRes.ok) {
    console.error('[youtube] detalhes falharam', await videosRes.text());
    return [];
  }
  const videosData = await videosRes.json();

  return (videosData.items ?? []).map((item: any): YoutubeVideo => ({
    videoId: item.id,
    titulo: item.snippet?.title ?? '',
    canal: item.snippet?.channelTitle ?? '',
    thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.default?.url ?? '',
    publicadoEm: item.snippet?.publishedAt ?? new Date().toISOString(),
    duracaoIso: item.contentDetails?.duration ?? 'PT0S',
    visualizacoes: Number(item.statistics?.viewCount ?? 0),
    curtidas: Number(item.statistics?.likeCount ?? 0),
    comentarios: Number(item.statistics?.commentCount ?? 0),
    origemQuery: query,
  }));
}
