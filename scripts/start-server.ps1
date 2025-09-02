# PowerShell script to start PocketBase server with network binding
$exePath = "../backend/pocketbase.exe"
$port = 8090
$bind = "0.0.0.0"

if (!(Test-Path $exePath)) {
    Write-Host "ERROR: pocketbase.exe not found in backend folder. Please download and place it in backend/."
    exit 1
}

Write-Host "Starting PocketBase server on http://$bind:$port ..."
Start-Process -NoNewWindow -FilePath $exePath -ArgumentList "serve --http=\"$bind:$port\""

# Display local and LAN access URLs
$hostname = hostname
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1 -ExpandProperty IPAddress)
Write-Host "Admin UI: http://localhost:$port/_/"
Write-Host "LAN UI:   http://$localIP:$port/_/"
Write-Host "(Press Ctrl+C in the server window to stop)"
