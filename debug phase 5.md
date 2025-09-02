# 🔧 PHASE 5 DEBUG: QUIZ DISPLAY ISSUES

## CONTEXT: You are debugging why quizzes aren't displaying in the user interface

**PROBLEM IDENTIFICATION:**
You have built the frontend interface but students cannot see available quizzes even though PocketBase has quizzes collection populated. This indicates a frontend-to-backend connection issue.

---

## TASK 5.0: DIAGNOSTIC & CONNECTION FIX
**EXACT PROMPT FOR AI:**
```
Debug and fix quiz display issues in user interface:

CONTEXT: PocketBase backend has quizzes collection with data, but frontend user dashboard shows no available quizzes.

IMMEDIATE DIAGNOSIS STEPS:

1. VERIFY POCKETBASE SERVICE CONNECTION:
Check services/pocketbase.js for:
- Correct API URL configuration
- Authentication headers
- Quiz fetching methods
- Error handling and logging

EXPECTED METHODS IN pocketbase.js:
- getAllQuizzes(includeInactive = false)
- getAvailableQuizzes(userId) 
- getQuizById(id, expand = [])

2. CHECK API RULES IN POCKETBASE:
Verify quizzes collection API rules:
- List rule: authenticated users (@request.auth.id != "")
- View rule: authenticated users
- Proper field permissions

3. VERIFY FRONTEND STORE:
Check stores/quiz.js for:
- availableQuizzes state
- loadAvailableQuizzes action
- Proper error handling

4. CHECK USER DASHBOARD:
Verify views/user/Dashboard.vue:
- Calling store actions on mounted
- Proper loading states
- Error display
- Console.log for debugging

DEBUGGING WORKFLOW:

STEP 1 - Add Debug Logging:
```javascript
// In services/pocketbase.js
async getAllQuizzes(includeInactive = false) {
  try {
    console.log('🔍 Fetching quizzes...', { includeInactive });
    const filters = includeInactive ? '' : 'is_active = true';
    const result = await this.pb.collection('quizzes').getList(1, 50, {
      filter: filters,
      sort: '-created'
    });
    console.log('✅ Quizzes fetched:', result);
    return result.items;
  } catch (error) {
    console.error('❌ Quiz fetch error:', error);
    throw error;
  }
}
```

STEP 2 - Verify Authentication:
```javascript
// Check if user is authenticated before fetching
const isAuth = this.pb.authStore.isValid;
console.log('🔐 Auth status:', isAuth, this.pb.authStore.model);
```

STEP 3 - Test Direct API Call:
```javascript
// In browser console, test direct call:
fetch('http://localhost:8090/api/collections/quizzes/records', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('pocketbase_auth_token')
  }
})
.then(r => r.json())
.then(console.log);
```

COMMON ISSUES TO CHECK:

1. CORS ISSUES:
- PocketBase CORS settings
- Frontend making requests to wrong URL
- Missing authentication headers

2. AUTHENTICATION PROBLEMS:
- User not properly logged in
- Expired auth tokens
- Wrong API rules

3. DATA STRUCTURE ISSUES:
- Collection name mismatch
- Field name differences
- Date format issues

4. FRONTEND STATE ISSUES:
- Store not properly initialized
- Component not calling store actions
- Reactive data not updating UI

IMMEDIATE FIXES TO IMPLEMENT:

FIX 1 - Enhanced PocketBase Service:
```javascript
class PocketBaseService {
  constructor() {
    this.pb = new PocketBase('http://localhost:8090');
    this.setupAuthRefresh();
    console.log('🚀 PocketBase initialized:', this.pb.baseUrl);
  }

  async getAllQuizzes(includeInactive = false) {
    if (!this.pb.authStore.isValid) {
      throw new Error('User not authenticated');
    }

    const filter = includeInactive ? '' : 'is_active = true';
    const result = await this.pb.collection('quizzes').getList(1, 50, {
      filter,
      sort: '-created',
      expand: 'questions_list'
    });

    return result.items;
  }
}
```

FIX 2 - Dashboard with Error Handling:
```vue
<template>
  <div class="dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      Loading quizzes...
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error">
      Error: {{ error }}
      <button @click="retry">Retry</button>
    </div>
    
    <!-- Quiz List -->
    <div v-else-if="quizzes.length > 0" class="quiz-grid">
      <QuizCard v-for="quiz in quizzes" :key="quiz.id" :quiz="quiz" />
    </div>
    
    <!-- Empty State -->
    <div v-else class="empty-state">
      No quizzes available
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useQuizStore } from '@/stores/quiz';

const quizStore = useQuizStore();
const loading = ref(true);
const error = ref(null);
const quizzes = ref([]);

const loadQuizzes = async () => {
  try {
    loading.value = true;
    error.value = null;
    quizzes.value = await quizStore.loadAvailableQuizzes();
  } catch (err) {
    error.value = err.message;
    console.error('Quiz loading error:', err);
  } finally {
    loading.value = false;
  }
};

const retry = () => {
  loadQuizzes();
};

onMounted(() => {
  loadQuizzes();
});
</script>
```

DELIVERABLE: Working quiz display with proper error handling and debugging
```

---

## TASK 5.1 REVISED: User Dashboard with Debug Features
**EXACT PROMPT FOR AI:**
```
Create user dashboard with enhanced debugging and error handling:

CONTEXT: Building robust dashboard that shows clear feedback about connection and data issues.

CREATE: views/user/Dashboard.vue with debug information

DASHBOARD SECTIONS (REVISED):

DEBUG PANEL (Development Mode):
- PocketBase connection status
- Authentication status display  
- API response times
- Error message display
- Raw quiz data inspector
- Refresh data button

QUIZ LOADING STATES:
- Initial loading spinner
- Empty state (no quizzes found)
- Error state with retry option
- Success state with quiz cards

QUIZ CARD ENHANCED:
```vue
<template>
  <div class="quiz-card" :class="cardStateClass">
    <div class="quiz-header">
      <h3>{{ quiz.title }}</h3>
      <span class="quiz-status">{{ quizStatus }}</span>
    </div>
    
    <div class="quiz-info">
      <p class="description">{{ quiz.description }}</p>
      <div class="quiz-meta">
        <span>{{ questionCount }} questions</span>
        <span>{{ quiz.duration_minutes }} minutes</span>
        <span class="difficulty">{{ difficulty }}</span>
      </div>
    </div>
    
    <div class="quiz-actions">
      <button 
        :disabled="!canStart" 
        @click="startQuiz"
        class="start-button"
      >
        {{ buttonText }}
      </button>
    </div>
    
    <!-- Debug Info -->
    <div v-if="showDebug" class="debug-info">
      <pre>{{ JSON.stringify(quiz, null, 2) }}</pre>
    </div>
  </div>
</template>
```

CONNECTION TESTING:
```javascript
// Add to composables/useConnectionTest.js
export function useConnectionTest() {
  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:8090/api/health');
      return { success: true, message: 'Connection OK' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const testAuthentication = () => {
    const auth = pb.authStore;
    return {
      isValid: auth.isValid,
      user: auth.model,
      token: auth.token ? 'Present' : 'Missing'
    };
  };

  return { testConnection, testAuthentication };
}
```

ENHANCED STORE:
```javascript
// stores/quiz.js with debug features
export const useQuizStore = defineStore('quiz', () => {
  const availableQuizzes = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const debugInfo = ref({});

  const loadAvailableQuizzes = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const startTime = Date.now();
      const quizzes = await pbService.getAllQuizzes(false);
      const endTime = Date.now();
      
      availableQuizzes.value = quizzes;
      debugInfo.value = {
        loadTime: endTime - startTime,
        count: quizzes.length,
        lastFetch: new Date().toISOString()
      };
      
      return quizzes;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    availableQuizzes,
    loading,
    error,
    debugInfo,
    loadAvailableQuizzes
  };
});
```

DELIVERABLE: Dashboard with comprehensive debugging and error handling
```

---

## TASK 5.2 UPDATED: Quiz Navigation with Status Checks
**EXACT PROMPT FOR AI:**
```
Create quiz taking interface with connection monitoring:

CONTEXT: Quiz interface must handle network issues and provide clear feedback.

CREATE: views/user/TakeQuiz.vue with connection awareness

PRE-QUIZ VALIDATION:
- Check PocketBase connection
- Verify quiz data loaded
- Validate user authentication
- Test timer functionality

QUIZ LOADING SEQUENCE:
1. Fetch quiz configuration
2. Load questions (with retry logic)  
3. Initialize timer
4. Setup auto-save
5. Enable security measures

CONNECTION MONITORING:
```javascript
// composables/useNetworkMonitor.js
export function useNetworkMonitor() {
  const isOnline = ref(navigator.onLine);
  const lastPing = ref(null);

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:8090/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      lastPing.value = Date.now();
      return response.ok;
    } catch {
      return false;
    }
  };

  const startMonitoring = () => {
    window.addEventListener('online', () => isOnline.value = true);
    window.addEventListener('offline', () => isOnline.value = false);
    
    setInterval(checkConnection, 30000); // Check every 30s
  };

  return { isOnline, lastPing, checkConnection, startMonitoring };
}
```

QUIZ DATA VALIDATION:
```javascript
const validateQuizData = (quiz) => {
  const errors = [];
  
  if (!quiz) errors.push('Quiz data missing');
  if (!quiz.title) errors.push('Quiz title missing');
  if (!quiz.duration_minutes) errors.push('Quiz duration missing');
  if (!quiz.questions_list?.length && !quiz.dynamic_config) {
    errors.push('No questions available');
  }
  
  return { valid: errors.length === 0, errors };
};
```

ERROR RECOVERY:
- Auto-retry failed requests
- Restore quiz state from localStorage
- Graceful degradation for offline mode
- Clear error messages and recovery steps

DELIVERABLE: Robust quiz interface with connection monitoring
```

---

## VERIFICATION CHECKLIST:

### BACKEND VERIFICATION:
- [ ] PocketBase running on http://localhost:8090
- [ ] Admin UI accessible at http://localhost:8090/_/
- [ ] Quizzes collection has test data
- [ ] API rules allow authenticated users to read quizzes
- [ ] CORS properly configured

### FRONTEND VERIFICATION:  
- [ ] Vue dev server running
- [ ] PocketBase service properly configured
- [ ] User authentication working
- [ ] Console shows successful API calls
- [ ] Quiz data renders in components
- [ ] Error states display properly

### DEBUGGING COMMANDS:
```bash
# Check PocketBase status
curl http://localhost:8090/api/health

# Test quiz API directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8090/api/collections/quizzes/records

# Check Vue dev server
npm run dev
```

This revised approach will help you identify and fix the exact issue preventing quizzes from displaying in your interface.