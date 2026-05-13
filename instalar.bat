@echo off
chcp 65001 >nul
title PlantiuIA — Instalação

echo.
echo ╔══════════════════════════════════════════════════╗
echo ║     🌱 PlantiuIA — Instalador de Dependências   ║
echo ║     Sistema Inteligente de IA para Agricultura   ║
echo ╚══════════════════════════════════════════════════╝
echo.

:: ============================================
:: Verificar Python
:: ============================================
echo [1/5] Verificando Python...
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python não encontrado! Instale Python 3.11+ em https://python.org
    echo    Marque "Add Python to PATH" durante a instalação.
    pause
    exit /b 1
)
for /f "tokens=2" %%a in ('python --version 2^>^&1') do set PYVER=%%a
echo ✅ Python %PYVER% encontrado

:: ============================================
:: Criar ambiente virtual
:: ============================================
echo.
echo [2/5] Configurando ambiente virtual...
if not exist "venv" (
    echo    Criando venv...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Erro ao criar ambiente virtual
        pause
        exit /b 1
    )
    echo ✅ Ambiente virtual criado
) else (
    echo ✅ Ambiente virtual já existe
)

:: Ativar venv
call venv\Scripts\activate.bat

:: ============================================
:: Instalar dependências Python
:: ============================================
echo.
echo [3/5] Instalando dependências Python...
echo    Isso pode levar alguns minutos na primeira vez...
pip install --upgrade pip >nul 2>&1
pip install -r backend\requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Algumas dependências podem ter falhado.
    echo    Se llama-cpp-python falhou, tente instalar manualmente:
    echo    pip install llama-cpp-python --prefer-binary
    echo.
)
echo ✅ Dependências instaladas

:: ============================================
:: Configurar .env
:: ============================================
echo.
echo [4/5] Configurando ambiente...
if not exist ".env" (
    copy .env.example .env >nul
    echo ✅ Arquivo .env criado a partir do template
    echo    ⚠️  Edite .env para adicionar suas API keys (opcional)
) else (
    echo ✅ Arquivo .env já existe
)

:: ============================================
:: Baixar modelo de IA local
:: ============================================
echo.
echo [5/5] Verificando modelo de IA local...

if not exist "backend\models_ai" mkdir backend\models_ai

:: Verificar se já existe algum modelo GGUF
dir /b backend\models_ai\*.gguf >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ╔══════════════════════════════════════════════════╗
    echo ║  📥 Baixando modelo de IA (SmolLM3 3B)          ║
    echo ║  Tamanho: ~2GB — Suporte nativo a Português     ║
    echo ║  Isso pode levar alguns minutos...              ║
    echo ╚══════════════════════════════════════════════════╝
    echo.
    python -c "from huggingface_hub import hf_hub_download; hf_hub_download(repo_id='bartowski/HuggingFaceTB_SmolLM3-3B-GGUF', filename='HuggingFaceTB_SmolLM3-3B-Q4_K_M.gguf', local_dir='backend/models_ai', local_dir_use_symlinks=False)"
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ⚠️  Download do modelo falhou. Você pode baixar manualmente:
        echo    1. Acesse: https://huggingface.co/bartowski/HuggingFaceTB_SmolLM3-3B-GGUF
        echo    2. Baixe: HuggingFaceTB_SmolLM3-3B-Q4_K_M.gguf
        echo    3. Coloque em: backend\models_ai\
        echo.
    ) else (
        echo ✅ Modelo de IA baixado com sucesso!
    )
) else (
    echo ✅ Modelo de IA já existe em backend\models_ai\
)

:: ============================================
:: Criar diretórios necessários
:: ============================================
if not exist "backend\data" mkdir backend\data
if not exist "backend\data\uploads" mkdir backend\data\uploads

:: ============================================
:: Finalização
:: ============================================
echo.
echo ╔══════════════════════════════════════════════════╗
echo ║  ✅ Instalação Concluída!                       ║
echo ║                                                  ║
echo ║  Para iniciar o PlantiuIA, execute:             ║
echo ║    iniciar.bat  (Windows)                       ║
echo ║    ./iniciar.sh (Linux/Mac)                     ║
echo ╚══════════════════════════════════════════════════╝
echo.
pause
