import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-brand-dark">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <img src="/icons/icon-192.png" alt="ViralHoje" className="mb-6 h-12 w-12 rounded-xl" />
        <h1 className="mb-1 text-2xl font-bold text-white">Entrar</h1>
        <p className="mb-6 text-sm text-white/60">Acesse suas tendências diárias.</p>

        <AuthForm modo="login" />

        <p className="mt-6 text-center text-sm text-white/60">
          Não tem conta?{' '}
          <Link href="/cadastro" className="font-semibold text-brand-pink">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
