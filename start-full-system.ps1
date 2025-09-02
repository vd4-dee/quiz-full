# start-full-system.ps1
# Start both backend and frontend for the quiz system

Write-Host "🚀 Starting Quiz System..." -ForegroundColor Green
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Check if backend port is available
if (Test-Port 8090) {
    Write-Host "⚠️  Port 8090 is already in use. Backend might already be running." -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 8090 is available for backend" -ForegroundColor Green
}

# Check if frontend port is available
if (Test-Port 5173) {
    Write-Host "⚠️  Port 5173 is already in use. Frontend might already be running." -ForegroundColor Yellow
} else {
    Write-Host "✅ Port 5173 is available for frontend" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Starting services..." -ForegroundColor Cyan

# Start backend
Write-Host "🔧 Starting PocketBase backend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\start-dev.ps1" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🎨 Starting Vue.js frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 System startup initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access URLs:" -ForegroundColor Cyan
Write-Host "   Backend Admin: http://localhost:8090/_/" -ForegroundColor White
Write-Host "   Frontend App:  http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "🌐 LAN Access URLs:" -ForegroundColor Yellow
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"} | Select-Object -First 1).IPAddress
if ($localIP) {
    Write-Host "   LAN Backend Admin: http://$localIP`:8090/_/" -ForegroundColor Green
    Write-Host "   LAN Frontend App:  http://$localIP`:5173" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Other devices on your network can access:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://$localIP`:5173" -ForegroundColor White
    Write-Host "   Backend API: http://$localIP`:8090/api/" -ForegroundColor White
} else {
    Write-Host "   Could not detect LAN IP address" -ForegroundColor Red
}
Write-Host ""
Write-Host "⏳ Please wait for both services to fully start..." -ForegroundColor Yellow
Write-Host "   Backend typically takes 5-10 seconds" -ForegroundColor Gray
Write-Host "   Frontend typically takes 10-15 seconds" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Check the opened PowerShell windows for startup logs" -ForegroundColor Cyan
