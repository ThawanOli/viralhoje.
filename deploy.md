---

```markdown
# 📖 Guia Definitivo de Implantação e Execução 24/7 (ViralHoje)

Este guia contém todos os passos detalhados para instalar, configurar e rodar o **ViralHoje** do zero em qualquer computador (Linux ou Windows) destinado a servir de servidor contínuo.

---

## 🛠️ Passo 1: Pré-requisitos
* **Node.js**: Versão 18 ou superior instalada ([nodejs.org](https://nodejs.org/)).
* **Git**: Instalado no sistema.

---

## 📥 Passo 2: Clonar o Repositório e Instalar
1. Abra o terminal (Prompt de Comando, PowerShell ou Terminal do Linux) na pasta onde deseja guardar o projeto.
2. Clone a sua versão do projeto e entre na pasta:
   ```bash
   git clone [https://github.com/ThawanOli/viralhoje.git](https://github.com/ThawanOli/viralhoje.git)
   cd viralhoje

```

3. Instale as dependências:
```bash
npm install

```



---

## 🔑 Passo 3: Gerar os Segredos e Configurar o `.env`

1. Na raiz da pasta `viralhoje`, crie um arquivo chamado **`.env`** (você pode copiar o modelo com `cp .env.example .env` no Linux ou `copy .env.example .env` no Windows).
2. Para preencher os segredos de segurança (`JWT_SECRET`, `CPF_ENCRYPTION_KEY`, `CPF_HASH_SECRET` e `CRON_SECRET`), você deve gerar **4 chaves aleatórias e independentes**.
Execute o comando abaixo no terminal **4 vezes** (uma vez para cada variável) e copie cada código gerado para o seu respectivo campo no `.env`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

```


3. Seu arquivo **`.env`** final deve ficar assim:

```env
# Banco de Dados Local (SQLite)
DATABASE_URL="file:./dev.db"

# Segredos de Segurança (Cole o resultado de cada execução do comando node acima)
JWT_SECRET="COLE_AQUI_O_1º_CODIGO_GERADO"
CPF_ENCRYPTION_KEY="COLE_AQUI_O_2º_CODIGO_GERADO"
CPF_HASH_SECRET="COLE_AQUI_O_3º_CODIGO_GERADO"
CRON_SECRET="COLE_AQUI_O_4º_CODIGO_GERADO"

# Sua Chave Oficial da YouTube Data API v3 (Obtida no Google Cloud Console)
YOUTUBE_API_KEY="AIzaSy..."

# Porta onde o app vai rodar
NEXT_PUBLIC_APP_URL="http://localhost:3001"

```

---

## 🗄️ Passo 4: Sincronizar o Banco de Dados (SQLite)

1. Abra o arquivo `prisma/schema.prisma` e garanta que o provedor está como `sqlite`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

```


2. No terminal, execute o comando para criar as tabelas no banco de dados local:
```bash
npm run db:push

```



---

## 🚀 Passo 5: Ligar o Servidor na Porta 3001

Escolha o comando de acordo com o Sistema Operacional da máquina:

* **Linux (Debian / Ubuntu):**
```bash
PORT=3001 npm run dev

```


* **Windows (Prompt de Comando - cmd):**
```cmd
set PORT=3001 && npm run dev

```


* **Windows (PowerShell):**
```powershell
$env:PORT="3001"; npm run dev

```



*Após rodar o comando, confirme se o app abriu acessando `http://localhost:3001` no navegador do computador.*

---

## 🌐 Passo 6: Configurar Acesso Remoto (Cloudflare Tunnel)

### 1. Instalar o `cloudflared` na Máquina:

* **No Linux:**
```bash
curl -L --output cloudflared.deb [https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb](https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb) && sudo dpkg -i cloudflared.deb

```


* **No Windows (PowerShell):**
```powershell
winget install --id Cloudflare.cloudflared

```



---

### 2. Gerar o Link de Acesso Externo (Gratuito):

Abra um **segundo terminal** (mantendo o servidor do Passo 5 rodando no primeiro) e execute:

```bash
cloudflared tunnel --url http://localhost:3001

```

O terminal exibirá uma linha com um endereço do tipo:
`https://xxxx-xxxx.trycloudflare.com`

**Pronto!** Abra esse link no navegador do seu celular de qualquer lugar do mundo (mesmo em redes móveis 4G/5G) e instale o app na tela inicial como PWA.

---

## ⚡ Ajuste Importante do Sistema (Servidor 24/7)

Como este computador funcionará como um servidor contínuo:

1. Vá até as **Configurações de Energia e Suspensão** do sistema operacional.
2. Defina o **Modo de Suspensão (Sleep)** como **"Nunca"** quando conectado à tomada.
3. Deixe apenas a opção de desligar a tela/monitor ativa para economizar energia sem desligar os processos internos.

```

```
