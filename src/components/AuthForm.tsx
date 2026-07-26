'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

type Modo = 'login' | 'cadastro';

function formatCpfInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function AuthForm({ modo }: { modo: Modo }) {
  const router = useRouter();
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);

    if (modo === 'cadastro') {
      if (senha !== confirmarSenha) {
        setErro('As senhas não coincidem');
        return;
      }
      if (!aceitouTermos) {
        setErro('É preciso concordar com o uso dos seus dados (nome, e-mail e CPF) para criar a conta');
        return;
      }
    }

    setCarregando(true);
    try {
      const endpoint = modo === 'cadastro' ? '/api/auth/register' : '/api/auth/login';
      const payload = modo === 'cadastro' ? { nomeCompleto, email, cpf, senha } : { email, senha };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? 'Algo deu errado, tente novamente');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setErro('Não foi possível conectar ao servidor');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {modo === 'cadastro' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">Nome completo</label>
          <input
            required
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-pink"
            placeholder="Seu nome completo"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-white/80">E-mail</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-pink"
          placeholder="voce@email.com"
        />
      </div>

      {modo === 'cadastro' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-white/80">CPF</label>
          <input
            required
            inputMode="numeric"
            value={cpf}
            onChange={(e) => setCpf(formatCpfInput(e.target.value))}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-pink"
            placeholder="000.000.000-00"
            maxLength={14}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-white/80">Senha</label>
        <input
          required
          type="password"
          minLength={modo === 'cadastro' ? 8 : undefined}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-pink"
          placeholder="••••••••"
        />
      </div>

      {modo === 'cadastro' && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">Confirmar senha</label>
            <input
              required
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-brand-pink"
              placeholder="••••••••"
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              className="mt-0.5"
            />
            Concordo que meu nome, e-mail e CPF sejam armazenados de forma segura (CPF criptografado)
            para criação e autenticação da minha conta, conforme a LGPD.
          </label>
        </>
      )}

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <button
        type="submit"
        disabled={carregando}
        className="mt-2 rounded-full bg-brand-gradient px-6 py-3 font-bold text-white shadow-lg disabled:opacity-60"
      >
        {carregando ? 'Aguarde...' : modo === 'cadastro' ? 'Criar conta' : 'Entrar'}
      </button>
    </form>
  );
}
