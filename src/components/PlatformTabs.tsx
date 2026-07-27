import Link from 'next/link';

const PLATFORMS = [
  { id: 'youtube', nome: 'YouTube', emoji: '▶️' },
  { id: 'instagram', nome: 'Instagram', emoji: '📸' },
] as const;

export type PlatformId = (typeof PLATFORMS)[number]['id'];

export function isValidPlatform(value: string | undefined): value is PlatformId {
  return PLATFORMS.some((p) => p.id === value);
}

export default function PlatformTabs({ nicheSlug, ativa }: { nicheSlug: string; ativa: PlatformId }) {
  return (
    <div className="mb-5 flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
      {PLATFORMS.map((p) => (
        <Link
          key={p.id}
          href={`/dashboard/${nicheSlug}?plataforma=${p.id}`}
          className={`flex-1 rounded-full px-3 py-2 text-center text-xs font-semibold transition ${
            ativa === p.id ? 'bg-brand-gradient text-white' : 'text-white/60'
          }`}
        >
          {p.emoji} {p.nome}
        </Link>
      ))}
    </div>
  );
}
