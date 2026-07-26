export type Niche = {
  slug: string;
  nome: string;
  descricaoCurta: string;
  emoji: string;
  corDe: string;
  corPara: string;
  keywords: string[];
};

export const NICHES: Niche[] = [
  {
    slug: 'ia',
    nome: 'Inteligência Artificial',
    descricaoCurta: 'Ferramentas, novidades e aplicações de IA que estão bombando.',
    emoji: '🤖',
    corDe: '#7C3AED',
    corPara: '#4C1D95',
    keywords: [
      'inteligência artificial',
      'inteligencia artificial',
      'IA generativa',
      'ChatGPT',
      'automação com IA',
      'ferramentas de IA',
      'agente de IA',
      'machine learning',
      'IA no trabalho',
    ],
  },
  {
    slug: 'ia-gestao-publica',
    nome: 'IA na Gestão Pública',
    descricaoCurta: 'Como a inteligência artificial está transformando o setor público.',
    emoji: '🏛️',
    corDe: '#2563EB',
    corPara: '#1E3A8A',
    keywords: [
      'IA no governo',
      'gestão pública',
      'governo digital',
      'inteligência artificial no setor público',
      'cidades inteligentes',
      'transformação digital governo',
      'serviços públicos digitais',
      'prefeitura digital',
    ],
  },
  {
    slug: 'marketing-politico',
    nome: 'Marketing Político Digital',
    descricaoCurta: 'Estratégias e formatos que viralizam em campanhas e comunicação política.',
    emoji: '🗳️',
    corDe: '#DC2626',
    corPara: '#7F1D1D',
    keywords: [
      'marketing político',
      'campanha eleitoral',
      'redes sociais política',
      'eleições',
      'candidato',
      'marketing digital para políticos',
      'estratégia eleitoral',
      'comunicação política',
    ],
  },
  {
    slug: 'emagrecimento',
    nome: 'Emagrecimento e Exercícios em Casa',
    descricaoCurta: 'Treinos, dietas e dicas de emagrecimento que mais viralizam.',
    emoji: '🏋️',
    corDe: '#F97316',
    corPara: '#9A3412',
    keywords: [
      'emagrecimento',
      'treino em casa',
      'dieta',
      'exercícios em casa',
      'perder peso',
      'treino sem equipamento',
      'dieta low carb',
      'jejum intermitente',
      'exercício para emagrecer',
    ],
  },
];

export function getNicheBySlug(slug: string): Niche | undefined {
  return NICHES.find((n) => n.slug === slug);
}
