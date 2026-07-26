// Integração com o Google Trends via pacote não-oficial "google-trends-api".
// Não requer chave de API, mas depende de um endpoint não documentado do Google,
// por isso tudo aqui tem um fallback seguro caso a chamada falhe ou mude de formato.
import googleTrends from 'google-trends-api';
import type { Niche } from './niches';

export type TrendTopic = {
  titulo: string;
  buscasFormatadas?: string;
};

// Lista de reserva usada apenas se a chamada ao Google Trends falhar,
// para o app nunca ficar sem conteúdo para mostrar.
const FALLBACK_TOPICS: string[] = [
  'inteligência artificial',
  'ChatGPT',
  'IA generativa',
  'governo digital',
  'cidades inteligentes',
  'eleições',
  'campanha eleitoral',
  'dieta low carb',
  'treino em casa',
  'emagrecimento',
];

export async function getDailyTrendsBR(): Promise<TrendTopic[]> {
  try {
    const raw = await googleTrends.dailyTrends({ geo: 'BR' });
    const parsed = JSON.parse(raw);
    const days = parsed?.default?.trendingSearchesDays ?? [];
    const topics: TrendTopic[] = [];

    for (const day of days) {
      for (const item of day.trendingSearches ?? []) {
        const titulo = item?.title?.query;
        if (!titulo) continue;
        topics.push({
          titulo,
          buscasFormatadas: item?.formattedTraffic,
        });
        for (const related of item?.relatedQueries ?? []) {
          if (related?.query) topics.push({ titulo: related.query });
        }
      }
    }

    if (topics.length === 0) throw new Error('Google Trends retornou lista vazia');
    return topics;
  } catch (err) {
    console.error('[googleTrends] falha ao buscar tendências diárias, usando fallback:', err);
    return FALLBACK_TOPICS.map((titulo) => ({ titulo }));
  }
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Pontua o quanto um tópico do Trends se relaciona com o nicho, por sobreposição de palavras-chave.
function scoreRelevancia(topico: string, niche: Niche): number {
  const topicoNorm = normalizar(topico);
  let score = 0;
  for (const kw of niche.keywords) {
    const kwNorm = normalizar(kw);
    if (topicoNorm.includes(kwNorm) || kwNorm.includes(topicoNorm)) {
      score += 2;
      continue;
    }
    const palavrasKw = kwNorm.split(/\s+/);
    const palavrasTopico = topicoNorm.split(/\s+/);
    const overlap = palavrasKw.filter((p) => palavrasTopico.includes(p)).length;
    score += overlap;
  }
  return score;
}

// Combina os tópicos do dia relacionados ao nicho com as palavras-chave "semente" do nicho,
// garantindo que sempre haja termos de busca suficientes para consultar o YouTube.
export function buildSearchQueriesForNiche(topics: TrendTopic[], niche: Niche, limite = 6): string[] {
  const relacionados = topics
    .map((t) => ({ ...t, score: scoreRelevancia(t.titulo, niche) }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite)
    .map((t) => t.titulo);

  const queries = [...new Set([...relacionados, ...niche.keywords])];
  return queries.slice(0, limite);
}
