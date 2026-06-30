@echo off
echo =========================================
echo    SecLabs Local Environment Setup
echo    (Decoupled Next.js + Python API)
echo =========================================

set FRESH_INSTALL=0

echo.
echo [1/3] Checking Python backend environment...
if not exist "venv" (
    echo Creating an isolated Python environment...
    C:\Users\Issam_ch4\AppData\Local\Programs\Python\Python314\python.exe -m venv venv
    set FRESH_INSTALL=1
)

echo.
echo [2/3] Activating backend environment...
call venv\Scripts\activate.bat

if %FRESH_INSTALL%==1 (
    echo Installing backend dependencies...
    pip install -r requirements.txt
    
    echo Initializing Database...
    python init_db.py
) else (
    echo Backend dependencies already installed. Skipping setup!
)

echo.
echo [3/3] Checking Node.js frontend environment...
if not exist "node_modules" (
    echo Installing Next.js dependencies...
    npm install
) else (
    echo Frontend dependencies already installed.
)

echo.
echo =========================================
echo    Starting SecLabs Servers...
echo =========================================

echo Starting Python API (Backend) on Port 5000...
start "SecLabs Backend API" cmd /c "call venv\Scripts\activate.bat && python api/index.py"

echo Starting Next.js UI (Frontend) on Port 3000...
start "SecLabs Frontend UI" cmd /c "npm run dev"

echo.
echo Servers are launching in separate windows! 
echo Once ready, access the UI at: http://localhost:3000
pause
