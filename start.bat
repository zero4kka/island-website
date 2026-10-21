@echo off
cd /d "%~dp0"

echo ========================================================
echo             STARTING ISLAND WEBSITE
echo ========================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [*] Node.js not detected. Opening index.html in default browser...
    start "" "%~dp0index.html"
    exit /b 0
)

echo [*] Launching Island Server...
node "%~dp0serve.js"
if %errorlevel% neq 0 (
    echo.
    echo [!] Server failed to run. Opening index.html directly in browser...
    start "" "%~dp0index.html"
    echo.
    pause
)
