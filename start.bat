@echo off
REM Starts the Baitcheck backend (Flask) and frontend (React/Vite) in two windows.
cd /d "%~dp0"

if not exist "backend\.venv\Scripts\python.exe" (
    echo Setting up Python environment - first run only, this can take a few minutes...
    python -m venv "backend\.venv" || goto :nopython
    "backend\.venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt" || goto :error
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    pushd frontend
    call npm install || goto :error
    popd
)

start "Baitcheck API" /D "%~dp0backend" cmd /k ".venv\Scripts\python.exe server.py"
start "Baitcheck UI" /D "%~dp0frontend" cmd /k "npm run dev -- --open"
echo Baitcheck is starting. Your browser will open automatically.
timeout /t 5 >nul
exit /b 0

:nopython
echo Python was not found. Install it from https://www.python.org/downloads/ and tick "Add Python to PATH".
pause
exit /b 1

:error
echo Setup failed - see the messages above.
pause
exit /b 1
