@echo off
echo =======================================================================
echo  Iniciando configuracao e automacao completa do ViralHoje...
echo =======================================================================
echo.

:: 1. Clonar o repositório
echo 1. Clonando o repositorio do GitHub...
git clone https://github.com/ThawanOli/viralhoje.git
cd viralhoje
set "PROJ_DIR=%CD%"
echo.

:: 2. Instalar dependências
echo 2. Instalando dependencias do projeto (aguarde)...
call npm install
echo.

:: 3. Gerar chaves aleatórias e criar o .env
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
echo YOUTUBE_API_KEY="COLE_SUA_CHAVE_DO_YOUTUBE_AQUI" >> .env
echo NEXT_PUBLIC_APP_URL="http://localhost:3001" >> .env
echo.

:: 4. Sincronizar banco de dados SQLite
echo 4. Sincronizando o Banco de Dados SQLite...
call npm run db:push
echo.

:: 5. Criar o script de inicialização automática (start.bat)
echo 5. Criando o arquivo de inicializacao automatica (start.bat)...
echo @echo off > start.bat
echo cd /d "%PROJ_DIR%" >> start.bat
echo start /b cmd /c "set PORT=3001 && npm run dev" >> start.bat
echo timeout /t 10 /nobreak ^>nul >> start.bat
echo cloudflared tunnel --url http://localhost:3001 >> start.bat
echo.

:: 6. Agendar a tarefa no Windows para rodar ao ligar o PC
echo 6. Configurando o Agendador de Tarefas do Windows...
schtasks /create /tn "ViralHoje_AutoStart" /tr "\"%PROJ_DIR%\start.bat\"" /sc onstart /ru SYSTEM /f >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Tarefa agendada com sucesso para rodar ao ligar o computador!
) else (
    echo [AVISO] Nao foi possivel criar a tarefa automatica. Execute este script como Administrador para ativar o agendamento automatico.
)

echo.
echo =======================================================================
echo  INSTALACAO CONCLUIDA COM SUCESSO!
echo =======================================================================
echo  1. Abra o arquivo .env gerado na pasta viralhoje.
echo  2. Cole sua YOUTUBE_API_KEY na linha correspondente.
echo  3. O app ja esta configurado para rodar sozinho sempre que o PC ligar!
echo =======================================================================
pause
