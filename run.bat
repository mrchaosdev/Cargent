@echo off
echo ============================================
echo   CAgent - Trainable AI Agent
echo ============================================
echo.
echo Checking Ollama...
where ollama >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Ollama not found in PATH.
    echo Please add Ollama to PATH or run from Ollama installation directory.
    echo Path: %LOCALAPPDATA%\Programs\Ollama\ollama.exe
    exit /b 1
)

echo Ollama found: %LOCALAPPDATA%\Programs\Ollama\ollama.exe
echo.

echo Checking models...
"%LOCALAPPDATA%\Programs\Ollama\ollama.exe" list 2>&1 | findstr /C:"llama3.1" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: llama3.1 not pulled. Pulling now...
    "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" pull llama3.1
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to pull model.
        exit /b 1
    )
)

echo.
echo Starting Ollama server...
start "" /min cmd /c "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" serve
timeout /t 3 /nobreak >nul

echo.
echo Starting CAgent...
echo.
npx ts-node src/cli/index.ts
