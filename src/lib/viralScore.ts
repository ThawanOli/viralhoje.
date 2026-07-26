import type { YoutubeVideo } from './youtube';

// Converte duração ISO 8601 (ex: "PT1M32S") em segundos.
export function parseDuracaoSegundos(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const horas = parseInt(match[1] ?? '0', 10);
  const minutos = parseInt(match[2] ?? '0', 10);
  const segundos = parseInt(match[3] ?? '0', 10);
  return horas * 3600 + minutos * 60 + segundos;
}

export function formatoDoVideo(iso: string): string {
  const segundos = parseDuracaoSegundos(iso);
  if (segundos <= 60) return 'Shorts/Reels (<60s)';
  if (segundos <= 180) return 'Vídeo curto (<3min)';
  return 'Vídeo longo';
}

function diasDesde(dataISO: string): number {
  const diffMs = Date.now() - new Date(dataISO).getTime();
  return Math.max(diffMs / (1000 * 60 * 60 * 24), 0.5);
}

// Score de 0 a 100 combinando alcance (views), engajamento (like/comment ratio),
// recência (views por dia) e bônus para formato curto, que tende a favorecer o algoritmo das plataformas.
export function computeViralScore(video: YoutubeVideo): number {
  const dias = diasDesde(video.publicadoEm);
  const viewsPorDia = video.visualizacoes / dias;
  const likeRatio = video.visualizacoes > 0 ? video.curtidas / video.visualizacoes : 0;
  const commentRatio = video.visualizacoes > 0 ? video.comentarios / video.visualizacoes : 0;
  const segundos = parseDuracaoSegundos(video.duracaoIso);

  const scoreAlcance = Math.min(Math.log10(viewsPorDia + 1) * 18, 55);
  const scoreEngajamento = Math.min((likeRatio * 1000 + commentRatio * 2000), 30);
  const bonusFormatoCurto = segundos <= 60 ? 10 : segundos <= 180 ? 5 : 0;
  const bonusRecencia = dias <= 3 ? 5 : 0;

  const total = scoreAlcance + scoreEngajamento + bonusFormatoCurto + bonusRecencia;
  return Math.round(Math.min(Math.max(total, 0), 100));
}

export function porqueViralizou(video: YoutubeVideo, score: number, formato: string): string {
  const dias = Math.round(diasDesde(video.publicadoEm));
  const likeRatio = video.visualizacoes > 0 ? (video.curtidas / video.visualizacoes) * 100 : 0;
  const viewsFormatado = video.visualizacoes.toLocaleString('pt-BR');

  const motivos: string[] = [];
  motivos.push(`${viewsFormatado} visualizações em ${dias} dia${dias === 1 ? '' : 's'}`);
  if (likeRatio > 3) motivos.push(`taxa de curtidas alta (${likeRatio.toFixed(1)}% dos views)`);
  if (formato.startsWith('Shorts')) motivos.push('formato curto (Shorts/Reels), favorecido pelo algoritmo de descoberta');
  if (dias <= 3) motivos.push('publicado muito recentemente, ainda em fase de pico de distribuição');
  motivos.push(`tema alinhado a uma busca em alta no Google Trends: "${video.origemQuery}"`);

  return `Score ${score}/100 — ${motivos.join('; ')}.`;
}
