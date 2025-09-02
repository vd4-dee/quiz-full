# 🌐 LAN Setup Guide - Quiz System

This guide explains how to run the Quiz System on your local network (LAN) so other devices can access it.

## 🚀 Quick Start

### Option 1: Use the LAN Startup Script (Recommended)
```powershell
.\start-lan-system.ps1
```

### Option 2: Use the Regular Startup Script
```powershell
.\start-full-system.ps1
```

## 🔧 Configuration Changes Made

### Backend (PocketBase)
- **File**: `backend/start-dev.ps1`
- **Change**: Added `--http=0.0.0.0:8090` to bind to all network interfaces
- **Result**: Backend accessible from any device on the network

### Frontend (Vue.js)
- **File**: `frontend/vite.config.js`
- **Change**: Added `host: '0.0.0.0'` to server configuration
- **Result**: Frontend accessible from any device on the network

## 🔥 Windows Firewall Configuration

### Automatic Configuration (Requires Admin)
```powershell
# Run PowerShell as Administrator
.\configure-firewall.ps1
```

### Manual Configuration
1. Open **Windows Defender Firewall**
2. Click **"Allow an app or feature through Windows Defender Firewall"**
3. Click **"Change settings"** then **"Allow another app..."**
4. Add rules for:
   - **Port 5173** (Frontend) - Allow for Private and Public networks
   - **Port 8090** (Backend) - Allow for Private and Public networks

## 📱 Access URLs

After starting the system, you'll see URLs like:

### Local Access (Same Computer)
- **Frontend**: http://localhost:5173
- **Backend Admin**: http://localhost:8090/_/

### LAN Access (Other Devices)
- **Frontend**: http://192.168.1.100:5173 (your actual IP)
- **Backend Admin**: http://192.168.1.100:8090/_/

## 🔍 Finding Your IP Address

The startup scripts automatically detect and display your LAN IP address. You can also find it manually:

### Windows Command Prompt
```cmd
ipconfig
```
Look for "IPv4 Address" under your network adapter.

### PowerShell
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}
```

## 📋 Testing LAN Access

1. **Start the system**: `.\start-lan-system.ps1`
2. **Note the LAN URLs** displayed in the console
3. **Test from another device**:
   - Open a web browser on another device
   - Navigate to the LAN Frontend URL (e.g., http://192.168.1.100:5173)
   - You should see the Quiz System interface

## 🛠️ Troubleshooting

### "Connection Refused" Error
- **Check Windows Firewall**: Ensure ports 5173 and 8090 are allowed
- **Verify IP Address**: Make sure you're using the correct LAN IP
- **Network Connection**: Ensure both devices are on the same network

### "Cannot Access" from Mobile Device
- **Check Network**: Ensure mobile device is connected to the same WiFi
- **Firewall Settings**: Make sure Windows Firewall allows connections
- **Port Accessibility**: Test if ports are accessible using network tools

### Backend Not Accessible
- **Check PocketBase**: Ensure PocketBase is running with `--http=0.0.0.0:8090`
- **Port Binding**: Verify the backend is bound to all interfaces, not just localhost

## 🔒 Security Considerations

### Development Environment
- This setup is intended for **development and testing**
- **Do not use in production** without proper security measures
- Consider using HTTPS in production environments

### Network Security
- Only devices on your local network can access the system
- Consider using a VPN for remote access
- Regularly update your system and applications

## 📊 Network Requirements

### Minimum Requirements
- **Bandwidth**: Standard home/office network (10+ Mbps)
- **Latency**: Low latency for responsive user experience
- **Stability**: Stable network connection for consistent access

### Recommended Setup
- **WiFi 5/6**: For wireless devices
- **Ethernet**: For desktop computers (more stable)
- **Router**: Modern router with good coverage

## 🎯 Use Cases

### Educational Environment
- **Classroom**: Students can access quizzes from their devices
- **Lab**: Multiple computers can run the system simultaneously
- **Remote Learning**: Access from home on the same network

### Office Environment
- **Training**: Employees can take quizzes from their workstations
- **Testing**: Multiple users can test the system simultaneously
- **Development**: Team members can access the development server

## 📞 Support

If you encounter issues with LAN access:

1. **Check the console output** for error messages
2. **Verify network connectivity** between devices
3. **Test firewall settings** using network tools
4. **Review the troubleshooting section** above

## 🔄 Reverting Changes

To disable LAN access and return to localhost-only:

### Backend
Edit `backend/start-dev.ps1` and remove `--http=0.0.0.0:8090` from the PocketBase command.

### Frontend
Edit `frontend/vite.config.js` and remove `host: '0.0.0.0'` from the server configuration.

---

**Happy Quizzing! 🎉**
