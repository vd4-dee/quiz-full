# 🚀 Quick Start Guide

## Manual Startup (If Scripts Don't Work)

### Option 1: Use Batch Files (Recommended for Windows)
```cmd
# Terminal 1 - Start Backend
cd backend
start-dev.bat

# Terminal 2 - Start Frontend  
cd frontend
start-dev.bat
```

### Option 2: Manual Commands

#### Step 1: Start Backend
```cmd
cd backend
pocketbase.exe serve
```

#### Step 2: Populate Sample Data (in new terminal)
```cmd
cd backend
node sample-data.js
node sample-quizzes.js
```

#### Step 3: Start Frontend (in new terminal)
```cmd
cd frontend
npm run dev
```

### Option 3: PowerShell (if you prefer)
```powershell
# Terminal 1
cd backend
.\start-dev.ps1

# Terminal 2
cd frontend  
.\start-dev.ps1
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend Admin**: http://localhost:8090/_/
- **Backend API**: http://localhost:8090/api/

## Troubleshooting

### If PowerShell Scripts Fail:
1. Use the `.bat` files instead
2. Or run commands manually as shown above

### If Backend Won't Start:
1. Check if port 8090 is free: `netstat -an | findstr 8090`
2. Kill any existing PocketBase processes: `taskkill /f /im pocketbase.exe`
3. Try running `pocketbase.exe serve` directly

### If Frontend Won't Start:
1. Ensure you're in the frontend directory
2. Run `npm install` first
3. Check if backend is running on port 8090

## What Gets Started

### Backend (PocketBase)
- Database server on port 8090
- Admin interface at `/_/`
- API endpoints at `/api/`
- Sample data (25 questions, 2 quizzes)

### Frontend (Vue.js)
- Development server on port 5173
- Hot reload enabled
- Debug panel (development mode only)
- Connection monitoring to backend
