@echo off
REM ============================================================
REM  PlantiumAI - inicia o servidor local de desenvolvimento
REM  - Verifica Node/npm
REM  - Analisa/instala dependencias (npm install se necessario)
REM  - Sobe o Vite dev server em http://localhost:5173
REM ============================================================

setlocal
cd /d "%~dp0"

echo.
echo [PlantiumAI] Diretorio: %CD%
echo.

REM --- Verifica Node ---
where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado no PATH. Instale em https://nodejs.org
    pause
    exit /b 1
)

REM --- Verifica npm ---
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERRO] npm nao encontrado no PATH.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node --version') do echo [PlantiumAI] Node %%v
for /f "delims=" %%v in ('npm --version') do echo [PlantiumAI] npm  %%v
echo.

REM --- Analisa dependencias ---
if not exist "node_modules" (
    echo [PlantiumAI] node_modules ausente. Instalando dependencias...
    if exist "package-lock.json" (
        call npm ci
    ) else (
        call npm install
    )
    if errorlevel 1 (
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
) else (
    echo [PlantiumAI] Verificando dependencias...
    call npm install
    if errorlevel 1 (
        echo [ERRO] Falha ao verificar/atualizar dependencias.
        pause
        exit /b 1
    )
)

echo.
echo [PlantiumAI] Subindo o servidor local em http://localhost:5173
echo [PlantiumAI] (Ctrl+C para encerrar)
echo.

REM --- Abre o navegador e sobe o dev server ---
start "" http://localhost:5173
call npm run dev

endlocal
