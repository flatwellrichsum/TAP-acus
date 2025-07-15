@echo off
REM ==========================
REM Local Server Startup Script
REM ==========================

REM Why do we need this batch file?
REM ------------------------------------------
REM The Web Audio API (for advanced sound playback)
REM only works properly when the page is served over HTTP(S).
REM Opening files directly with file:// protocol
REM restricts its functionality.

REM Therefore, we start a simple local HTTP server
REM to simulate a real web server environment,
REM so the Web Audio API can function correctly.

REM This script uses Python (if installed) to start the server.
REM The command below will launch the server on port 8000.

REM You can change the port number if needed.

echo ----------------------------------------
echo Starting local HTTP server...
echo Please open your browser at http://localhost:8000
echo To stop the server, simply close this window.
echo ----------------------------------------

REM Start Python HTTP server in the current folder
python -m http.server 8000

REM Pause when server stops (optional)
pause
