import Link from 'next/link';
import { NICHES } from '@/lib/niches';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-brand-gradient">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <header className="flex items-center gap-2">
          <img src="/icons/icon-192.png" alt="ViralHoje" className="h-10 w-10 rounded-xl" />
          <span className="text-xl font-bold text-white">ViralHoje</span>
        </header>

        <section className="mt-10 flex-1">
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            As tendências virais de hoje, direto no seu nicho.
          </h1>
          <p className="mt-4 text-white/85">
            Todo dia, 10 tendências e formatos de vídeo com maior potencial de alcance,
            já analisados: o que viralizou e por quê. Escolha, baixe e remixe.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {NICHES.map((n) => (
              <div key={n.slug} className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-2xl">{n.emoji}</div>
                <div className="mt-1 text-sm font-semibold text-white">{n.nome}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10 flex flex-col gap-3 pb-6">
          <Link
            href="/cadastro"
            className="rounded-full bg-white px-6 py-3 text-center font-bold text-brand-purple shadow-lg"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/40 px-6 py-3 text-center font-semibold text-white"
          >
            Já tenho conta
          </Link>
        </footer>
      </div>
    </main>
  );
}
