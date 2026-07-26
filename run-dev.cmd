@echo off
cd /d "%~dp0"
set PATH=C:\Program Files\nodejs;%PATH%
set NODE_OPTIONS=--use-system-ca
npm run dev
