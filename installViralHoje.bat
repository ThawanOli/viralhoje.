@echo off
echo Iniciando configuracao automatica do ViralHoje...
echo.

echo 1. Clonando o repositorio do GitHub...
git clone https://github.com/ThawanOli/viralhoje.git
cd viralhoje
echo.

echo 2. Instalando dependencias do projeto (Isso pode demorar um pouco)...
call npm install
echo.

echo 3. Gerando chaves de seguranca e criando o arquivo .env...
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set JWT_SEC=%%i
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set CPF_ENC=%%i
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set CPF_HASH=%%i
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set CRON_SEC=%%i

echo DATABASE_URL="file:./dev.db" > .env
echo JWT_SECRET="%JWT_SEC%" >> .env
echo CPF_ENCRYPTION_KEY="%CPF_ENC%" >> .env
echo CPF_HASH_SECRET="%CPF_HASH%" >> .env
echo CRON_SECRET="%CRON_SEC%" >> .env
echo YOUTUBE_API_KEY="AIzaSyD2hW0RWL3LhSt6WwkGyBMW9HtxmyBaJSM" >> .env
echo NEXT_PUBLIC_APP_URL="http://localhost:3001" >> .env
echo.

echo 4. Sincronizando o Banco de Dados SQLite...
call npm run db:push
echo.

echo =======================================================================
echo TUDO PRONTO! A instalacao foi concluida.
echo 1. Abra o arquivo .env que foi criado na pasta viralhoje
echo 2. Substitua "COLE_SUA_CHAVE_DO_YOUTUBE_AQUI" pela sua chave real.
echo 3. Para rodar o app, digite no terminal: set PORT=3001 ^&^& npm run dev
echo =======================================================================
pause
