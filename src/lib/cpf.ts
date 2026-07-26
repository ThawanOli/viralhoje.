import crypto from 'crypto';

export function normalizarCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

// Algoritmo padrão de validação de dígitos verificadores do CPF.
export function isValidCpf(cpfInput: string): boolean {
  const cpf = normalizarCpf(cpfInput);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i], 10) * (10 - i);
  let resto = 11 - (soma % 11);
  const dv1 = resto >= 10 ? 0 : resto;
  if (dv1 !== parseInt(cpf[9], 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i], 10) * (11 - i);
  resto = 11 - (soma % 11);
  const dv2 = resto >= 10 ? 0 : resto;
  if (dv2 !== parseInt(cpf[10], 10)) return false;

  return true;
}

export function maskCpf(cpf: string): string {
  const c = normalizarCpf(cpf);
  return `***.***.**${c.slice(9, 10)}-${c.slice(10, 11)}`;
}

function getEncryptionKey(): Buffer {
  const key = process.env.CPF_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error('CPF_ENCRYPTION_KEY ausente ou inválida: defina 64 caracteres hexadecimais (32 bytes) no .env');
  }
  return Buffer.from(key, 'hex');
}

// Criptografia reversível (AES-256-GCM) para exibir o CPF mascarado ao próprio dono depois.
export function encryptCpf(cpf: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(normalizarCpf(cpf), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decryptCpf(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
}

// Hash determinístico (HMAC) usado apenas para checar duplicidade de CPF sem guardar o número em texto puro pesquisável.
export function hashCpf(cpf: string): string {
  const secret = process.env.CPF_HASH_SECRET;
  if (!secret) throw new Error('CPF_HASH_SECRET ausente: defina no .env');
  return crypto.createHmac('sha256', secret).update(normalizarCpf(cpf)).digest('hex');
}
