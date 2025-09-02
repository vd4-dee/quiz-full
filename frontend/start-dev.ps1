# start-dev.ps1
# Start Vue.js frontend development server

Write-Host "Starting Vue.js Frontend Development Server..." -ForegroundColor Green

# Change to frontend directory
Set-Location $PSScriptRoot

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Blue
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8090/api/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "Backend is not running. Please start the backend first:" -ForegroundColor Yellow
    Write-Host "   cd ../backend" -ForegroundColor Gray
    Write-Host "   .\start-dev.ps1" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

Write-Host "Starting Vue.js development server with LAN access..." -ForegroundColor Blue
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8090/api/" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 LAN Access Information:" -ForegroundColor Yellow
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"} | Select-Object -First 1).IPAddress
if ($localIP) {
    Write-Host "   LAN Frontend: http://$localIP`:5173" -ForegroundColor Green
    Write-Host "   LAN Backend API: http://$localIP`:8090/api/" -ForegroundColor Green
} else {
    Write-Host "   Could not detect LAN IP address" -ForegroundColor Red
}
Write-Host ""

# Start the development server
npm run dev
