@echo off
setlocal EnableExtensions EnableDelayedExpansion
set "PORT=3000"
set "URL=http://localhost:%PORT%"
set "PROJECT_DIR=%~dp0"
title VileDocx Web Launcher

cd /d "%PROJECT_DIR%"

echo.
echo  ============================================
echo    VileDocx Web - starting up...
echo    Project folder: %PROJECT_DIR%
echo  ============================================
echo.

REM ---- Check for Node.js ----
where node >nul 2>nul
if errorlevel 1 (
    echo  [X] Node.js is not installed.
    echo.
    echo      Please install Node.js 18 or newer from:
    echo      https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node --version') do set NODE_VER=%%v
echo  [OK] Node.js found: !NODE_VER!

REM ---- Install dependencies on first run ----
if not exist "node_modules" (
    echo  [*] First run detected - installing dependencies ^(this can take a minute^)...
    echo.
    call npm install --no-fund --no-audit
    if errorlevel 1 (
        echo.
        echo  [X] npm install failed. Check your internet connection and try again.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies installed.
) else (
    echo  [OK] Dependencies already installed.
)

REM ---- Free port 3000 if a stale server is holding it ----
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    echo  [*] Port %PORT% is in use by PID %%p - stopping it...
    taskkill /PID %%p /F >nul 2>nul
)

REM ---- Start server and open browser ----
echo  [OK] Starting server...
start "" /min cmd /c "cd /d ""%PROJECT_DIR%"" && npm run dev -- --host 0.0.0.0 --port %PORT% > viledocx-server.log 2>&1"

REM Wait for the server to answer, then open the browser
where curl >nul 2>nul
if errorlevel 1 (
    echo  [*] Waiting a few seconds for the server...
    timeout /t 6 /nobreak >nul
    goto openbrowser
)
set "HTTP_CODE=000"
set /a tries=0
:waitloop
timeout /t 1 /nobreak >nul
set /a tries+=1
set "HTTP_CODE=000"
curl -s -o nul -w "%%{http_code}" --max-time 2 %URL% > "%TEMP%\viledocx_http.txt" 2>nul
set /p HTTP_CODE=<"%TEMP%\viledocx_http.txt"
if not "%HTTP_CODE%"=="200" (
    if %tries% lss 60 goto waitloop
    echo  [X] Server did not start in time. Check viledocx-server.log for details.
    pause
    exit /b 1
)

:openbrowser

echo  [OK] Server is live at %URL%
echo  [OK] Opening in your browser...
start "" "%URL%"

echo.
echo  ============================================
echo    VileDocx Web is running.
echo    Keep this window open ^(or minimize it^).
echo    Press any key to STOP the server.
echo  ============================================
pause >nul

echo  [*] Stopping server...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    taskkill /PID %%p /F >nul 2>nul
)
echo  [OK] Server stopped.
timeout /t 2 /nobreak >nul
