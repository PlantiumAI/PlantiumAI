@echo off
chcp 65001 >nul
title PlantiuIA — Servidor

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║       🌱 PlantiuIA — Agricultura Inteligente     ║
echo ╚══════════════════════════════════════════════════╝
echo.

:: ============================================
:: Verificar se instalação foi feita
:: ============================================
if not exist "venv" (
    echo ❌ Ambiente virtual não encontrado!
    echo    Execute 'instalar.bat' primeiro.
    pause
    exit /b 1
)

:: Ativar venv
call venv\Scripts\activate.bat

:: Verificar se dependências estão instaladas
python -c "import fastapi" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Dependências não instaladas!
    echo    Execute 'instalar.bat' primeiro.
    pause
    exit /b 1
)

:: ============================================
:: Verificar modelo de IA
:: ============================================
dir /b backend\models_ai\*.gguf >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Modelo de IA local não encontrado.
    echo    O sistema funcionará com provedores de API ou Ollama.
    echo    Para baixar o modelo, execute 'instalar.bat' novamente.
    echo.
)

:: ============================================
:: Iniciar servidor
:: ============================================
echo 🚀 Iniciando servidor PlantiuIA...
echo    Dashboard: http://localhost:8000
echo    API Docs:  http://localhost:8000/docs
echo.
echo    Pressione Ctrl+C para parar o servidor.
echo ──────────────────────────────────────────
echo.

:: Abrir navegador após 2 segundos
start "" /b cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:8000"

:: Iniciar FastAPI
cd backend
python main.py
cd ..
