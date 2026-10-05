@echo off
title LendTrack Demo Launcher
echo =================================================================
echo   LendTrack - Private Quick Lending Management System
echo =================================================================
echo.
echo Launching local server on http://localhost:4173 ...
echo.

cd /d "%~dp0\dist"

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Python HTTP server on port 4173...
    start http://localhost:4173
    python -m http.server 4173
    goto done
)

where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting npx serve on port 4173...
    start http://localhost:4173
    npx -y serve -p 4173
    goto done
)

echo Neither Python nor Node/npx was detected in your PATH.
echo Opening index.html directly in your default browser...
start index.html

:done
pause
