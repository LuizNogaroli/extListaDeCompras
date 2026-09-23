@echo off
setlocal

set "ROOT=%~dp0"

echo ============================================
echo  Lista de Compras - ambiente de testes local
echo ============================================
echo.

echo [1/3] Backend (http://localhost:3333)...
start "Backend - Lista de Compras" cmd /k "cd /d "%ROOT%backend" && (if not exist node_modules npm install) && npm run dev"

echo [2/3] Extensao / app da nova aba (http://localhost:5173)...
start "Extensao - Lista de Compras" cmd /k "cd /d "%ROOT%extension" && (if not exist node_modules npm install) && npm run dev"

echo [3/3] Aguardando os servidores subirem...
timeout /t 5 /nobreak >nul

echo Abrindo o navegador...
start "" "http://localhost:5173/src/newtab/index.html"

echo.
echo Pronto! Duas janelas ficaram abertas rodando o backend e a extensao.
echo Feche essas janelas (ou pressione Ctrl+C nelas) para encerrar os servidores.
echo.
pause
endlocal
