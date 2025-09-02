# start-lan-system.ps1
# Start the quiz system with LAN access enabled

Write-Host "Starting Quiz System with LAN Access..." -ForegroundColor Green
Write-Host ""

# Function to get local IP address
function Get-LocalIP {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.IPAddress -like "192.168.*" -or 
        $_.IPAddress -like "10.*" -or 
        $_.IPAddress -like "172.*"
    } | Select-Object -First 1).IPAddress
    
    if (-not $localIP) {
        $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
            $_.IPAddress -ne "127.0.0.1"
        } | Select-Object -First 1).IPAddress
    }
    
    return $localIP
}

# Get local IP
$localIP = Get-LocalIP

if ($localIP) {
    Write-Host "Detected Local IP: $localIP" -ForegroundColor Cyan
} else {
    Write-Host "Could not detect local IP address" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting services with LAN access..." -ForegroundColor Blue

# Start backend with LAN access
Write-Host "Starting PocketBase backend (LAN enabled)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\start-dev.ps1" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend with LAN access
Write-Host "Starting Vue.js frontend (LAN enabled)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "LAN System startup initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "Local Access URLs:" -ForegroundColor Cyan
Write-Host "   Backend Admin: http://localhost:8090/_/" -ForegroundColor White
Write-Host "   Frontend App:  http://localhost:5173" -ForegroundColor White
Write-Host ""

if ($localIP) {
    Write-Host "LAN Access URLs:" -ForegroundColor Yellow
    Write-Host "   Backend Admin: http://$localIP`:8090/_/" -ForegroundColor Green
    Write-Host "   Frontend App:  http://$localIP`:5173" -ForegroundColor Green
    Write-Host ""
    Write-Host "Share these URLs with other devices on your network:" -ForegroundColor Cyan
    Write-Host "   Quiz App: http://$localIP`:5173" -ForegroundColor White
    Write-Host "   Admin Panel: http://$localIP`:8090/_/" -ForegroundColor White
    Write-Host ""
    Write-Host "QR Code for easy mobile access:" -ForegroundColor Magenta
    Write-Host "   Frontend: http://$localIP`:5173" -ForegroundColor White
} else {
    Write-Host "LAN access URLs not available (IP detection failed)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Please wait for both services to fully start..." -ForegroundColor Yellow
Write-Host "   Backend typically takes 5-10 seconds" -ForegroundColor Gray
Write-Host "   Frontend typically takes 10-15 seconds" -ForegroundColor Gray
Write-Host ""
Write-Host "Check the opened PowerShell windows for startup logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tips for LAN access:" -ForegroundColor Magenta
Write-Host "   - Make sure Windows Firewall allows connections on ports 5173 and 8090" -ForegroundColor Gray
Write-Host "   - Other devices must be on the same network" -ForegroundColor Gray
Write-Host "   - Use the LAN URLs above to access from other devices" -ForegroundColor Gray
