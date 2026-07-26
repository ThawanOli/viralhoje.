import { JWT } from 'google-auth-library';

// Autenticação via conta de serviço do Google Cloud, usada como alternativa a uma
// chave de API simples para chamar a YouTube Data API v3 (útil quando a organização
// do Google Cloud do usuário restringe a criação de "API keys" e só permite contas
// de serviço). A chave privada nunca deve ir para o repositório — fica só no .env.
let cachedClient: JWT | null = null;

function getClient(): JWT {
  if (cachedClient) return cachedClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      'Credenciais da conta de serviço ausentes: defina GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY no .env'
    );
  }

  cachedClient = new JWT({
    email,
    key: rawKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
  });
  return cachedClient;
}

export function hasServiceAccountCredentials(): boolean {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
}

// google-auth-library já cuida de cache/renovação do token internamente.
export async function getGoogleAccessToken(): Promise<string> {
  const client = getClient();
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Não foi possível obter um access token da conta de serviço do Google');
  return token;
}
