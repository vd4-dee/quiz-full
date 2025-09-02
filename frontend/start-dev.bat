@echo off
REM start-dev.bat
REM Start Vue.js frontend development server

echo 🚀 Starting Vue.js Frontend Development Server...

REM Change to frontend directory
cd /d "%~dp0"

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if backend is running
curl -s http://localhost:8090/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Backend is not running. Please start the backend first:
    echo    cd ../backend
    echo    start-dev.bat
    echo.
    set /p "continue=Press Enter to continue anyway or Ctrl+C to exit"
)

echo 🔧 Starting Vue.js development server...
echo 🌐 Frontend will be available at: http://localhost:5173
echo 📡 Backend API: http://localhost:8090/api/
echo.

REM Start the development server
npm run dev
