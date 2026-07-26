import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isValidCpf, hashCpf, encryptCpf } from '@/lib/cpf';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';

const schema = z.object({
  nomeCompleto: z.string().trim().min(3, 'Informe seu nome completo').max(150),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  cpf: z.string().refine(isValidCpf, 'CPF inválido'),
  senha: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres'),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 });
  }

  const { nomeCompleto, email, cpf, senha } = parsed.data;
  const cpfHash = hashCpf(cpf);

  const existente = await prisma.user.findFirst({
    where: { OR: [{ email }, { cpfHash }] },
  });
  if (existente) {
    return NextResponse.json({ error: 'E-mail ou CPF já cadastrado' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      nomeCompleto,
      email,
      cpfHash,
      cpfEncrypted: encryptCpf(cpf),
      senhaHash: await hashPassword(senha),
    },
  });

  const token = await createSessionToken({ userId: user.id, nomeCompleto: user.nomeCompleto, email: user.email });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
