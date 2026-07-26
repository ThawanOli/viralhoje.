# ViralHoje

App (PWA) que, todo dia, busca no Google Trends os assuntos em alta no Brasil e cruza com a
YouTube Data API para montar um ranking das **10 tendências/vídeos com maior potencial viral do
dia**, em 4 módulos de nicho: Inteligência Artificial, IA na Gestão Pública, Marketing Político
Digital e Emagrecimento/Exercícios em Casa.

> ✅ Testado de ponta a ponta em ambiente local (Node.js 24, Windows): cadastro, login, proteção de
> rotas, busca real de tendências via YouTube Data API e degradação graciosa quando alguma fonte
> externa falha. Detalhes e limitações conhecidas abaixo.

## Stack

- **Next.js 14** (App Router, TypeScript) — front-end + back-end (API routes) no mesmo projeto, o
  que facilita rodar tudo "na nuvem" em um único serviço.
- **Prisma + SQLite** (dev) — troque facilmente para Postgres em produção (Neon/Supabase/Railway).
- **Tailwind CSS** — UI mobile-first, minimalista.
- **PWA nativo** (manifest.json + service worker escritos à mão, sem dependência extra) —
  instalável no iPhone e Android via link, sem loja de apps.
- **Google Trends** via pacote `google-trends-api` (não-oficial, com fallback caso o Google mude o
  endpoint — isso acontece com alguma frequência, ver "Limitações conhecidas" abaixo).
- **YouTube Data API v3** (oficial) para descobrir os vídeos públicos com mais visualizações
  relacionados às tendências do dia. Suporta dois jeitos de autenticar (veja abaixo).

## Por que só Google Trends + YouTube, e não TikTok/Instagram?

TikTok e Instagram não oferecem API pública de "tendências". Um scraper não-oficial violaria os
Termos de Serviço dessas plataformas. Por decisão explícita nesta primeira versão, o app usa fontes
**oficiais e legítimas** (Google Trends + YouTube Data API). Se depois quiser adicionar
TikTok/Instagram, o caminho recomendado é contratar uma API paga de terceiros que já tenha esse
acesso autorizado (ex: serviços via RapidAPI) e plugar um novo módulo em `src/lib/`, seguindo o
mesmo padrão de `youtube.ts`.

## Sobre baixar os vídeos (decisão tomada após teste real)

A primeira versão tinha um botão que baixava o vídeo original pelo servidor (via
`@distube/ytdl-core`). **Isso foi testado e removido**: o YouTube bloqueou a requisição de stream
com erro 403 em todos os vídeos testados, porque atualizou o esquema de ofuscação do player e a
biblioteca ainda não tinha acompanhado — algo que se repete com frequência, já que o YouTube
ativamente dificulta esse tipo de download não-oficial (e não autoriza isso nos Termos de Serviço).

Por isso o botão hoje **abre o vídeo no YouTube** (app ou site), e o usuário baixa por lá usando a
função nativa de download offline do próprio YouTube — 100% confiável e sem risco extra de Termos
de Serviço.

## Limitações conhecidas

- **Google Trends (`google-trends-api`) pode retornar HTML em vez de JSON** — o Google
  ocasionalmente bloqueia esse endpoint não-oficial. Quando isso acontece, o app usa
  automaticamente uma lista de palavras-chave fixas por nicho (fallback em `src/lib/niches.ts`) e
  continua funcionando, só perde a "novidade" das tendências do dia até o endpoint voltar a
  responder normalmente.
- **Certificado TLS corporativo/antivírus**: se rodar em uma rede com um proxy ou antivírus que
  intercepta HTTPS (comum em máquinas corporativas), o Node pode recusar conexões ao Google com o
  erro `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. Solução usada aqui: rodar o Node com a flag
  `--use-system-ca` (já configurada em `run-dev.cmd`), que faz o Node confiar também nos
  certificados raiz instalados no Windows.

## Rodando localmente

Pré-requisito: [Node.js 18+](https://nodejs.org) instalado.

```bash
cd viralhoje
npm install
cp .env.example .env
# edite o .env: gere os segredos e configure a credencial do YouTube (veja abaixo)
npm run db:push
npm run dev
```

Abra http://localhost:3000.

### Autenticando na YouTube Data API v3 (duas opções)

**Opção A — Chave de API (mais simples, recomendada):**

1. Acesse https://console.cloud.google.com/ e crie/selecione um projeto.
2. **APIs e Serviços → Biblioteca** → busque **"YouTube Data API v3"** → **Ativar**.
3. **APIs e Serviços → Credenciais → "+ CRIAR CREDENCIAIS" → "Chave de API"** (não "ID do cliente
   OAuth" nem "Conta de serviço" — essas são credenciais diferentes e não funcionam do mesmo jeito).
4. Cole a chave gerada (formato `AIzaSy...`) em `YOUTUBE_API_KEY` no `.env`.

**Opção B — Conta de serviço (quando a organização do Google Cloud bloqueia criação de API keys):**

1. Ative a "YouTube Data API v3" no mesmo projeto da conta de serviço.
2. No `.env`, preencha `GOOGLE_SERVICE_ACCOUNT_EMAIL` (campo `client_email` do JSON da conta de
   serviço) e `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (campo `private_key` do mesmo JSON, mantendo os
   `\n` literais dentro das aspas).
3. Deixe `YOUTUBE_API_KEY=""` vazio — o app detecta automaticamente e usa a conta de serviço.
4. **Nunca commite o arquivo JSON da conta de serviço** nem cole a chave privada em nenhum lugar
   público — trate como uma senha.

Se nenhuma das duas estiver configurada, o app não quebra: cada nicho mostra "não encontramos
vídeos em alta agora" em vez de dar erro 500.

### Gerando os segredos (JWT_SECRET, CPF_ENCRYPTION_KEY, CPF_HASH_SECRET, CRON_SECRET)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Rode o comando 4 vezes (um valor para cada variável). `CPF_ENCRYPTION_KEY` **precisa** ter
exatamente 64 caracteres hexadecimais (32 bytes).

## Deploy na nuvem (grátis)

Recomendado: **Render** ou **Railway** (não Vercel) — o processo de atualizar as tendências do dia
faz várias chamadas externas em sequência (Google Trends + várias buscas no YouTube por nicho), o
que pode passar do limite de tempo de execução do plano gratuito de funções serverless da Vercel.
Render/Railway rodam o Next.js como um processo Node.js normal, sem esse limite.

1. Crie um banco Postgres gratuito (ex: Neon ou o Postgres do próprio Render/Railway) e troque
   `provider = "sqlite"` para `provider = "postgresql"` em `prisma/schema.prisma`, apontando
   `DATABASE_URL` para ele.
2. Configure as variáveis de ambiente do `.env.example` no painel do serviço escolhido.
3. Build command: `npm run build` — Start command: `npm run start` (rode `npm run db:push` uma vez,
   manualmente ou como *release command*, para criar as tabelas).
4. Configure um agendador externo gratuito (ex: https://cron-job.org) para fazer, uma vez por dia,
   um `POST` para `https://SEU-DOMINIO/api/cron/refresh-trends` com o header
   `x-cron-secret: <valor de CRON_SECRET>`. Isso atualiza as 10 tendências de cada nicho. (Mesmo
   sem isso, a primeira pessoa que abrir um nicho no dia dispara a atualização automaticamente —
   o cron só evita que o primeiro acesso do dia demore mais.)

## Instalando no iPhone/Android via link (sem loja de apps)

Como é um PWA, basta abrir o link do app publicado no navegador:

- **iPhone (Safari):** toque em Compartilhar → "Adicionar à Tela de Início".
- **Android (Chrome):** toque no menu (⋮) → "Instalar app" ou "Adicionar à tela inicial".

O app passa a abrir em tela cheia, com ícone próprio, como um app nativo.

## LGPD — dados sensíveis (CPF)

O cadastro coleta nome completo, e-mail, CPF e senha. Neste projeto:

- A senha é armazenada só como hash (bcrypt), nunca em texto puro.
- O CPF é armazenado **criptografado** (AES-256-GCM) e também como um hash HMAC não-reversível
  (`cpfHash`), usado apenas para impedir cadastro duplicado sem precisar descriptografar nada.

Mesmo assim, **você (responsável pelo produto) precisa de uma política de privacidade e uma base
legal para coletar CPF** antes de lançar para usuários reais — isso é responsabilidade do
operador do serviço, não algo que o código sozinho resolve. Vale reavaliar se o CPF é realmente
necessário no MVP.

## Estrutura do projeto

```
src/
  app/                    páginas (App Router) e rotas de API
    api/auth/...          cadastro, login, logout
    api/trends/[niche]/   retorna as tendências do dia de um nicho
    api/cron/refresh-trends/   endpoint chamado pelo agendador diário
    dashboard/            seleção de nicho + lista de tendências (protegido por middleware)
  components/             UI (cards, formulário de auth, navegação)
  lib/                    regras de negócio: auth, cpf, niches, googleTrends, youtube,
                           googleServiceAuth, viralScore, trendAggregator, prisma
  middleware.ts           protege as rotas /dashboard/*
prisma/schema.prisma      modelos User e DailyTrend
public/                   manifest.json, service worker, ícones do app
run-dev.cmd               inicia o servidor com PATH do Node e --use-system-ca (Windows)
```

## Nome e identidade visual

**Nome:** ViralHoje.
**Logo:** ícone arredondado com gradiente roxo → rosa → laranja, com uma chama se transformando em
seta de tendência ascendente (arquivos em `public/icons/`, gerados via Canva). Se quiser variações,
o design editável está em: https://www.canva.com/d/NxYAG-yJhMXi_Rh
