@echo off
chcp 65001 >nul
cls
echo ========================================
echo    Yuna Parfum Development Setup
echo ========================================
echo.

echo [1] Checking for MongoDB...
where mongod >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ MongoDB found. Starting MongoDB...
    start /min cmd /c "mongod"
) else (
    echo     ! MongoDB not found in PATH.
    echo     Please start MongoDB manually if needed.
)

echo.
echo [2] Starting Backend Server...
echo     Opening new window for backend...
start "Yuna Backend" cmd /k "cd /d %~dp0backend && echo Starting Backend... && npm run dev"

echo.
echo [3] Waiting for backend to initialize...
ping 127.0.0.1 -n 4 > nul

echo [4] Starting Frontend Development Server...
echo     Opening new window for frontend...
start "Yuna Frontend" cmd /k "cd /d %~dp0frontend && echo Starting Frontend... && npm start"

echo.
echo ========================================
echo    Development Environment Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Check the separate windows for server logs.
echo Close this window when done developing.
echo.
pause
