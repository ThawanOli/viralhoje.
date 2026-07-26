'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const isDashboardHome = pathname === '/dashboard';

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-brand-dark/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${
            isDashboardHome ? 'text-brand-pink' : 'text-white/60'
          }`}
        >
          <span className="text-lg">🏠</span>
          Nichos
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center gap-0.5 px-4 py-1 text-xs text-white/60">
          <span className="text-lg">🚪</span>
          Sair
        </button>
      </div>
    </nav>
  );
}
