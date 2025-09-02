# configure-firewall.ps1
# Configure Windows Firewall to allow LAN access for the quiz system

Write-Host "🔥 Configuring Windows Firewall for Quiz System LAN Access..." -ForegroundColor Green
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  This script requires administrator privileges to configure firewall rules." -ForegroundColor Yellow
    Write-Host "   Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Alternative: Manually configure Windows Firewall:" -ForegroundColor Cyan
    Write-Host "   1. Open Windows Defender Firewall" -ForegroundColor Gray
    Write-Host "   2. Click 'Allow an app or feature through Windows Defender Firewall'" -ForegroundColor Gray
    Write-Host "   3. Add rules for ports 5173 (frontend) and 8090 (backend)" -ForegroundColor Gray
    Write-Host "   4. Allow both Private and Public networks" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Running with administrator privileges" -ForegroundColor Green
Write-Host ""

# Function to add firewall rule
function Add-FirewallRule {
    param(
        [string]$Name,
        [int]$Port,
        [string]$Description
    )
    
    try {
        # Remove existing rule if it exists
        Remove-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
        
        # Add new rule
        New-NetFirewallRule -DisplayName $Name -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -Profile Private,Public -Description $Description | Out-Null
        Write-Host "✅ Added firewall rule: $Name (Port $Port)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to add firewall rule: $Name" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Add firewall rules
Write-Host "🔧 Adding firewall rules..." -ForegroundColor Blue

Add-FirewallRule -Name "Quiz System Frontend" -Port 5173 -Description "Allow LAN access to Vue.js frontend development server"
Add-FirewallRule -Name "Quiz System Backend" -Port 8090 -Description "Allow LAN access to PocketBase backend server"

Write-Host ""
Write-Host "🎉 Firewall configuration completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of changes:" -ForegroundColor Cyan
Write-Host "   • Port 5173 (Frontend) - Allowed for Private and Public networks" -ForegroundColor White
Write-Host "   • Port 8090 (Backend) - Allowed for Private and Public networks" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your quiz system is now ready for LAN access!" -ForegroundColor Green
Write-Host "   Run '.\start-lan-system.ps1' to start the system with LAN access enabled." -ForegroundColor Cyan
