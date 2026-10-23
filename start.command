#!/usr/bin/env bash
# ==============================================================================
# VileDocx Web — macOS launcher
# Double-click this file in Finder to start VileDocx in your default browser.
# (If macOS blocks it: right-click -> Open, or run once with: bash start.command)
# This script is explicitly tied to the project folder it sits in.
# ==============================================================================
set -u

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$SCRIPT_DIR"
PORT=3000
URL="http://localhost:$PORT"

printf '\n'
printf ' ============================================\n'
printf '   VileDocx Web - starting up...\n'
printf '   Project folder: %s\n' "$SCRIPT_DIR"
printf ' ============================================\n'
printf '\n'

# ---- Check for Node.js ----
if ! command -v node >/dev/null 2>&1; then
    printf ' [X] Node.js is not installed.\n'
    printf '\n'
    printf '     Please install Node.js 18 or newer:\n'
    printf '       brew install node   (or https://nodejs.org)\n'
    printf '\n'
    read -r -p 'Press Enter to close...'
    exit 1
fi
printf ' [OK] Node.js found: %s\n' "$(node --version)"

# ---- Install dependencies on first run ----
if [ ! -d node_modules ]; then
    printf ' [*] First run - installing dependencies (this can take a minute)...\n'
    printf '\n'
    if ! npm install --no-fund --no-audit; then
        printf '\n'
        printf ' [X] npm install failed. Check your internet connection and try again.\n'
        read -r -p 'Press Enter to close...'
        exit 1
    fi
    printf '\n'
    printf ' [OK] Dependencies installed.\n'
else
    printf ' [OK] Dependencies already installed.\n'
fi

# ---- Free port 3000 if a stale server is holding it ----
STALE_PIDS=""
if command -v lsof >/dev/null 2>&1; then
    STALE_PIDS=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
fi
if [ -n "$STALE_PIDS" ]; then
    printf ' [*] Port %s was in use - stopping the old server...\n' "$PORT"
    printf '%s\n' "$STALE_PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# ---- Start server ----
printf ' [OK] Starting server...\n'
npm run dev -- --host 0.0.0.0 --port "$PORT" > "$SCRIPT_DIR/viledocx-server.log" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT INT TERM

# ---- Wait for the server to answer ----
CODE="000"
ATTEMPT=0
while [ "$ATTEMPT" -lt 60 ]; do
    if command -v curl >/dev/null 2>&1; then
        CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 "$URL" 2>/dev/null || true)
    else
        CODE="200"
    fi
    if [ "$CODE" = "200" ]; then
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    sleep 1
done

if [ "$CODE" != "200" ]; then
    printf ' [X] Server did not start in time. See viledocx-server.log for details.\n'
    read -r -p 'Press Enter to close...'
    exit 1
fi

printf ' [OK] Server is live at %s\n' "$URL"

# ---- Open in the default browser ----
open "$URL"

printf '\n'
printf ' ============================================\n'
printf '   VileDocx Web is running.\n'
printf '   Keep this window open.\n'
printf '   Press Ctrl+C to stop the server.\n'
printf ' ============================================\n'
printf '\n'

wait "$SERVER_PID"
