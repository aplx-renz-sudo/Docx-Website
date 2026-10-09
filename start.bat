@echo off
setlocal EnableDelayedExpansion
title VileDocx Web Launcher

cd /d "%~dp0"

echo.
echo  ============================================
echo    VileDocx Web - starting up...
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
    call npm install
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
REM Prefer tasklist (locale-independent) over netstat, because 'LISTENING'
REM may be translated on non-English Windows systems.
set "STALE_PID="
for /f "tokens=2 delims=," %%p in ('tasklist /fi "IMAGENAME eq node.exe" /fo csv /nh 2^>nul ^| findstr /i "node.exe"') do (
    set "STALE_PID=%%~p"
)
if defined STALE_PID (
    REM Only act if port 3000 is actually in a LISTENING state for this PID.
    for /f "tokens=5 delims= " %%a in ('netstat -ano ^| findstr /r ":.3000.*LISTENING" 2^>nul') do (
        if "%%a"=="!STALE_PID!" (
            echo  [*] Port 3000 was in use by PID !STALE_PID! - stopping it...
            taskkill /PID !STALE_PID! /F >nul 2>nul
        )
    )
    set "STALE_PID="
)

REM ---- Start server and open browser ----
echo  [OK] Starting server...
start "" /min cmd /c "npm run dev > "%~dp0viledocx-server.log" 2>&1"

REM Wait for the server to answer, then open the browser
where curl >nul 2>nul
if errorlevel 1 (
    REM No curl on this machine: give the server a few seconds, then open anyway
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
curl -s -o nul -w "%%{http_code}" --max-time 2 http://localhost:3000 > "%TEMP%\viledocx_http.txt" 2>nul
if exist "%TEMP%\viledocx_http.txt" (
    set /p HTTP_CODE=<"%TEMP%\viledocx_http.txt"
)
if not "!HTTP_CODE!"=="200" (
    if !tries! lss 30 goto waitloop
    echo  [X] Server did not start in time. Check viledocx-server.log for details.
    pause
    exit /b 1
)

:openbrowser

echo  [OK] Server is live at http://localhost:3000
echo  [OK] Opening in your browser...
start "" "http://localhost:3000"

echo.
echo  ============================================
echo    VileDocx Web is running.
echo    Keep this window open ^(or minimize it^).
echo    Press any key to STOP the server.
echo  ============================================
pause >nul

echo  [*] Stopping server...
REM Kill the node process that is serving on port 3000, using the same
REM tasklist-based discovery as above so this works on non-English Windows.
for /f "tokens=2 delims=," %%p in ('tasklist /fi "IMAGENAME eq node.exe" /fo csv /nh 2^>nul ^| findstr /i "node.exe"') do (
    set "NODE_PID=%%~p"
)
if defined NODE_PID (
    taskkill /PID !NODE_PID! /F >nul 2>nul
    echo  [OK] Server stopped.
) else (
    echo  [!] No node process found to stop.
)
timeout /t 2 /nobreak >nul
