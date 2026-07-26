import { NICHES } from '@/lib/niches';
import { getSession } from '@/lib/auth';
import NicheCard from '@/components/NicheCard';
import BottomNav from '@/components/BottomNav';

export default async function DashboardPage() {
  const session = await getSession();
  const primeiroNome = session?.nomeCompleto?.split(' ')[0] ?? '';

  return (
    <main className="min-h-screen bg-brand-dark pb-24">
      <div className="mx-auto max-w-md px-6 py-8">
        <header className="mb-6">
          <p className="text-sm text-white/60">Olá, {primeiroNome} 👋</p>
          <h1 className="text-2xl font-bold text-white">Escolha um nicho</h1>
          <p className="mt-1 text-sm text-white/60">Tendências atualizadas todo dia.</p>
        </header>

        <div className="flex flex-col gap-4">
          {NICHES.map((niche) => (
            <NicheCard key={niche.slug} niche={niche} />
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
