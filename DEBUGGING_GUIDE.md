# 🔧 Quiz Display Debugging Guide

## Overview
This guide helps you diagnose and fix why quizzes aren't displaying in the user interface.

## Quick Start

### 1. Start the Backend
```powershell
cd backend
.\start-dev.ps1
```

### 2. Start the Frontend
```powershell
cd frontend
.\start-dev.ps1
```

### 3. Open the Application
- Frontend: http://localhost:5173
- Backend Admin: http://localhost:8090/_/

## Debug Checklist

### ✅ Backend Verification

1. **PocketBase Running**
   ```powershell
   # Test if PocketBase is running
   curl http://localhost:8090/api/health
   ```
   Expected: `200 OK` response

2. **Collections Exist**
   - Visit: http://localhost:8090/_/
   - Login with admin credentials
   - Check that `questions`, `quizzes`, `users`, `submissions` collections exist

3. **Sample Data Present**
   ```powershell
   # Check questions
   curl http://localhost:8090/api/collections/questions/records
   
   # Check quizzes
   curl http://localhost:8090/api/collections/quizzes/records
   ```

4. **API Rules Configured**
   - In PocketBase admin, check each collection's API rules:
   - **List rule**: `@request.auth.id != ""`
   - **View rule**: `@request.auth.id != ""`

### ✅ Frontend Verification

1. **Development Mode Debug Panel**
   - Open frontend at http://localhost:5173
   - Look for yellow debug panel (only shows in development)
   - Check connection status, auth status, and load times

2. **Browser Console**
   ```javascript
   // Open browser console (F12) and look for:
   
   // ✅ Success logs
   "🔍 Loading available quizzes..."
   "✅ Quizzes loaded successfully:"
   
   // ❌ Error logs
   "❌ Error loading quizzes:"
   "⚠️ PocketBase: User not authenticated"
   ```

3. **Network Tab**
   - Open browser dev tools > Network tab
   - Refresh page and look for:
   - `GET /api/collections/quizzes/records` - should return `200 OK`
   - Check if request includes proper authentication headers

### ✅ Authentication Check

1. **User Login**
   - Ensure you're logged in as a student user
   - Check the debug panel shows "✅ Authenticated"

2. **Test Authentication**
   ```javascript
   // In browser console
   console.log('Auth Store:', window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps[0].$pinia._s.get('auth'))
   ```

## Common Issues & Solutions

### 🔴 Issue: "No quizzes available"

**Possible Causes:**
1. Backend not running
2. No sample data
3. Authentication failed
4. API rules blocking access

**Solutions:**
```powershell
# 1. Restart backend with sample data
cd backend
.\start-dev.ps1

# 2. Check if user is logged in
# Go to http://localhost:5173/login

# 3. Check API rules in PocketBase admin
# Visit http://localhost:8090/_/
```

### 🔴 Issue: "Connection Failed"

**Possible Causes:**
1. PocketBase not running on port 8090
2. CORS issues
3. Firewall blocking connection

**Solutions:**
```powershell
# Check if port is in use
netstat -an | findstr 8090

# Restart PocketBase
cd backend
.\pocketbase.exe serve

# Check Windows Firewall settings
```

### 🔴 Issue: "User not authenticated"

**Possible Causes:**
1. Not logged in
2. Session expired
3. Invalid auth token

**Solutions:**
1. Go to login page: http://localhost:5173/login
2. Clear browser storage and login again
3. Check auth store in Vue devtools

### 🔴 Issue: API Returns Empty Array

**Possible Causes:**
1. No sample data in database
2. Incorrect filter (is_active = false)
3. Wrong collection name

**Solutions:**
```powershell
# Populate sample data
cd backend
node sample-data.js
node sample-quizzes.js

# Check data directly in admin UI
# Visit http://localhost:8090/_/collections/quizzes
```

## Debug Commands

### Test Backend Connection
```powershell
# Test health endpoint
curl http://localhost:8090/api/health

# Test quizzes endpoint (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8090/api/collections/quizzes/records
```

### Test Frontend API Calls
```javascript
// In browser console
fetch('http://localhost:8090/api/collections/quizzes/records', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('pocketbase_auth_token')
  }
})
.then(r => r.json())
.then(console.log)
```

### Check Vue Store State
```javascript
// In browser console (with Vue devtools)
const app = window.__VUE_DEVTOOLS_GLOBAL_HOOK__.apps[0]
const authStore = app.$pinia._s.get('auth')
const quizStore = app.$pinia._s.get('quiz')

console.log('Auth:', authStore)
console.log('Quiz Store:', quizStore)
```

## Debug Panel Features

The frontend includes a comprehensive debug panel (development mode only):

- **Connection Status**: Shows if backend is reachable
- **Auth Status**: Shows if user is authenticated
- **Load Time**: API response times
- **Last Fetch**: When data was last loaded
- **Test Connection**: Manual connection test
- **Refresh Data**: Reload all data
- **Raw Data Inspector**: View actual API responses

## Getting Help

If issues persist:

1. Check browser console for detailed error messages
2. Check PocketBase logs in the terminal
3. Verify all collections exist with proper API rules
4. Test API endpoints directly with curl or Postman
5. Clear browser cache and storage

## Sample Data

The system includes comprehensive sample data:
- **25 Questions** across Excel, Python, and Pandas
- **2 Sample Quizzes** 
- **Various difficulty levels**: Easy, Normal, Hard, Very Hard
- **Multiple categories**: Excel, Python, Pandas

Sample data is automatically loaded when you run `.\start-dev.ps1` in the backend directory.
