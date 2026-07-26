import Link from 'next/link';
import type { Niche } from '@/lib/niches';

export default function NicheCard({ niche }: { niche: Niche }) {
  return (
    <Link
      href={`/dashboard/${niche.slug}`}
      className="block rounded-2xl p-5 shadow-lg transition active:scale-[0.98]"
      style={{ background: `linear-gradient(135deg, ${niche.corDe}, ${niche.corPara})` }}
    >
      <div className="text-3xl">{niche.emoji}</div>
      <div className="mt-2 text-lg font-bold text-white">{niche.nome}</div>
      <div className="mt-1 text-sm text-white/80">{niche.descricaoCurta}</div>
      <div className="mt-3 text-xs font-semibold text-white/90">Ver tendências de hoje →</div>
    </Link>
  );
}
