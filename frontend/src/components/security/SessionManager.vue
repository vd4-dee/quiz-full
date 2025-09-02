<template>
  <div class="session-manager">
    <!-- Session Status Indicator -->
    <div 
      v-if="showSessionStatus"
      class="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
    >
      <div class="flex items-center space-x-2">
        <div 
          :class="getSessionStatusClass()"
          class="w-3 h-3 rounded-full"
        ></div>
        <span class="text-sm font-medium text-gray-700">
          {{ getSessionStatusText() }}
        </span>
        <span class="text-xs text-gray-500">
          ({{ formatTimeRemaining() }})
        </span>
      </div>
    </div>

    <!-- Session Warning Modal -->
    <div 
      v-if="showSessionWarning"
      class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg max-w-md mx-4">
        <div class="flex items-center mb-4">
          <ExclamationTriangleIcon class="w-8 h-8 text-yellow-500 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">Session Warning</h3>
        </div>
        
        <p class="text-gray-600 mb-4">{{ sessionWarningMessage }}</p>
        
        <div class="flex space-x-3">
          <button 
            @click="extendSession"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Extend Session
          </button>
          <button 
            @click="closeSessionWarning"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Continue
          </button>
        </div>
      </div>
    </div>

    <!-- Session Expired Modal -->
    <div 
      v-if="showSessionExpired"
      class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg max-w-md mx-4 text-center">
        <ClockIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-2">Session Expired</h3>
        <p class="text-gray-600 mb-4">Your session has expired. Please log in again to continue.</p>
        
        <button 
          @click="handleSessionExpired"
          class="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Return to Login
        </button>
      </div>
    </div>

    <!-- Session Activity Monitor -->
    <div 
      v-if="showActivityMonitor"
      class="fixed bottom-4 left-4 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
    >
      <div class="text-center">
        <div class="text-xs text-gray-500 mb-1">Activity</div>
        <div class="flex items-center justify-center space-x-1">
          <div 
            v-for="(activity, index) in recentActivity"
            :key="index"
            :class="getActivityIndicatorClass(activity)"
            class="w-2 h-2 rounded-full"
          ></div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="session-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import { 
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  sessionTimeout: {
    type: Number,
    default: 30 // minutes
  },
  warningThreshold: {
    type: Number,
    default: 5 // minutes before expiry
  },
  showStatus: {
    type: Boolean,
    default: true
  },
  showActivity: {
    type: Boolean,
    default: true
  },
  autoExtend: {
    type: Boolean,
    default: true
  },
  maxExtensions: {
    type: Number,
    default: 3
  }
})

// Emits
const emit = defineEmits([
  'session-warning',
  'session-expired',
  'session-extended',
  'session-activity',
  'session-status-change'
])

// Reactive state
const showSessionStatus = ref(props.showStatus)
const showSessionWarning = ref(false)
const showSessionExpired = ref(false)
const showActivityMonitor = ref(props.showActivity)
const sessionWarningMessage = ref('')

// Session state
const sessionState = reactive({
  isActive: false,
  startTime: null,
  lastActivity: null,
  expiryTime: null,
  warningShown: false,
  expired: false,
  extensionsUsed: 0,
  activityHistory: [],
  securityEvents: []
})

// Timers
let sessionTimer = null
let warningTimer = null
let activityTimer = null
let heartbeatTimer = null

// Session configuration
const sessionConfig = reactive({
  heartbeatInterval: 30000, // 30 seconds
  activityCheckInterval: 10000, // 10 seconds
  maxInactivityTime: 300000, // 5 minutes
  extensionDuration: 15 // 15 minutes
})

// Computed properties
const timeRemaining = computed(() => {
  if (!sessionState.expiryTime) return 0
  return Math.max(0, sessionState.expiryTime - Date.now())
})

const isSessionExpired = computed(() => {
  return timeRemaining.value <= 0
})

const isSessionWarning = computed(() => {
  return timeRemaining.value <= props.warningThreshold * 60 * 1000 && 
         timeRemaining.value > 0
})

const recentActivity = computed(() => {
  return sessionState.activityHistory.slice(-10)
})

// Methods
const initializeSession = () => {
  if (!props.enabled) return
  
  sessionState.isActive = true
  sessionState.startTime = Date.now()
  sessionState.lastActivity = Date.now()
  sessionState.expiryTime = Date.now() + (props.sessionTimeout * 60 * 1000)
  
  emit('session-status-change', { 
    status: 'active', 
    startTime: sessionState.startTime,
    expiryTime: sessionState.expiryTime 
  })
  
  // Start session monitoring
  startSessionMonitoring()
  
  // Set up activity tracking
  setupActivityTracking()
  
  // Start heartbeat
  startHeartbeat()
}

const startSessionMonitoring = () => {
  // Main session timer
  sessionTimer = setInterval(checkSessionStatus, 1000)
  
  // Warning timer
  warningTimer = setInterval(checkWarningThreshold, 1000)
  
  // Activity monitoring
  activityTimer = setInterval(checkActivity, sessionConfig.activityCheckInterval)
}

const checkSessionStatus = () => {
  if (isSessionExpired.value && !sessionState.expired) {
    sessionState.expired = true
    showSessionExpired.value = true
    emit('session-expired', {
      startTime: sessionState.startTime,
      duration: Date.now() - sessionState.startTime,
      reason: 'timeout'
    })
    
    // Clean up session
    cleanupSession()
  }
}

const checkWarningThreshold = () => {
  if (isSessionWarning.value && !sessionState.warningShown) {
    sessionState.warningShown = true
    showSessionWarning.value = true
    
    const minutesRemaining = Math.ceil(timeRemaining.value / (60 * 1000))
    sessionWarningMessage.value = `Your session will expire in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}. Would you like to extend it?`
    
    emit('session-warning', {
      timeRemaining: timeRemaining.value,
      message: sessionWarningMessage.value
    })
  }
}

const checkActivity = () => {
  const now = Date.now()
  const timeSinceLastActivity = now - sessionState.lastActivity
  
  if (timeSinceLastActivity > sessionConfig.maxInactivityTime) {
    recordSecurityEvent('inactivity', 'User inactive for extended period')
    
    if (props.autoExtend && sessionState.extensionsUsed < props.maxExtensions) {
      extendSession()
    }
  }
  
  // Update activity history
  updateActivityHistory()
}

const setupActivityTracking = () => {
  // Track user interactions
  const events = ['mousedown', 'mousemove', 'keydown', 'click', 'scroll', 'touchstart']
  
  events.forEach(eventType => {
    document.addEventListener(eventType, trackActivity, { passive: true })
  })
  
  // Track focus changes
  window.addEventListener('focus', trackActivity)
  window.addEventListener('blur', trackActivity)
  
  // Track visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange)
}

const trackActivity = () => {
  sessionState.lastActivity = Date.now()
  
  // Record activity for monitoring
  recordActivity('user_interaction')
  
  // Emit activity event
  emit('session-activity', {
    timestamp: Date.now(),
    type: 'user_interaction'
  })
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    recordSecurityEvent('tab_switch', 'User switched tabs')
  } else {
    trackActivity()
  }
}

const recordActivity = (type) => {
  const activity = {
    type,
    timestamp: Date.now(),
    active: true
  }
  
  sessionState.activityHistory.push(activity)
  
  // Keep only last 50 activities
  if (sessionState.activityHistory.length > 50) {
    sessionState.activityHistory.shift()
  }
}

const recordSecurityEvent = (type, description) => {
  const event = {
    type,
    description,
    timestamp: Date.now(),
    severity: getSecurityEventSeverity(type)
  }
  
  sessionState.securityEvents.push(event)
  
  // Keep only last 100 security events
  if (sessionState.securityEvents.length > 100) {
    sessionState.securityEvents.shift()
  }
}

const getSecurityEventSeverity = (type) => {
  const severityMap = {
    inactivity: 'low',
    tab_switch: 'medium',
    session_expiry: 'high',
    multiple_extensions: 'medium'
  }
  
  return severityMap[type] || 'low'
}

const updateActivityHistory = () => {
  const now = Date.now()
  const threshold = 5 * 60 * 1000 // 5 minutes
  
  // Mark old activities as inactive
  sessionState.activityHistory.forEach(activity => {
    if (now - activity.timestamp > threshold) {
      activity.active = false
    }
  })
}

const startHeartbeat = () => {
  heartbeatTimer = setInterval(() => {
    // Send heartbeat to server
    emit('session-status-change', {
      status: 'heartbeat',
      timestamp: Date.now(),
      sessionId: generateSessionId()
    })
  }, sessionConfig.heartbeatInterval)
}

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const extendSession = () => {
  if (sessionState.extensionsUsed >= props.maxExtensions) {
    sessionWarningMessage.value = 'Maximum session extensions reached. Please complete your work soon.'
    return
  }
  
  const extensionMs = props.extensionDuration * 60 * 1000
  sessionState.expiryTime += extensionMs
  sessionState.extensionsUsed++
  sessionState.warningShown = false
  
  showSessionWarning.value = false
  
  emit('session-extended', {
    newExpiryTime: sessionState.expiryTime,
    extensionDuration: extensionMs,
    extensionsUsed: sessionState.extensionsUsed
  })
  
  // Reset warning state
  sessionState.warningShown = false
}

const closeSessionWarning = () => {
  showSessionWarning.value = false
}

const handleSessionExpired = () => {
  showSessionExpired.value = false
  
  // Redirect to login or handle expired session
  emit('session-expired', {
    action: 'redirect_to_login',
    timestamp: Date.now()
  })
}

const cleanupSession = () => {
  // Clear timers
  if (sessionTimer) clearInterval(sessionTimer)
  if (warningTimer) clearInterval(warningTimer)
  if (activityTimer) clearInterval(activityTimer)
  if (heartbeatTimer) clearInterval(heartbeatTimer)
  
  // Remove event listeners
  const events = ['mousedown', 'mousemove', 'keydown', 'click', 'scroll', 'touchstart']
  events.forEach(eventType => {
    document.removeEventListener(eventType, trackActivity)
  })
  
  window.removeEventListener('focus', trackActivity)
  window.removeEventListener('blur', trackActivity)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  
  // Reset state
  sessionState.isActive = false
  sessionState.expired = true
}

// Utility methods
const getSessionStatusClass = () => {
  if (sessionState.expired) return 'bg-red-500'
  if (isSessionWarning.value) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getSessionStatusText = () => {
  if (sessionState.expired) return 'Expired'
  if (isSessionWarning.value) return 'Warning'
  return 'Active'
}

const formatTimeRemaining = () => {
  if (timeRemaining.value <= 0) return 'Expired'
  
  const minutes = Math.floor(timeRemaining.value / (60 * 1000))
  const seconds = Math.floor((timeRemaining.value % (60 * 1000)) / 1000)
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const getActivityIndicatorClass = (activity) => {
  return activity.active ? 'bg-green-500' : 'bg-gray-300'
}

// Public methods (exposed via ref)
const refreshSession = () => {
  if (sessionState.isActive && !sessionState.expired) {
    sessionState.lastActivity = Date.now()
    trackActivity()
  }
}

const forceExpire = () => {
  sessionState.expired = true
  showSessionExpired.value = true
  cleanupSession()
}

// Expose methods
defineExpose({
  refreshSession,
  forceExpire,
  getSessionState: () => ({ ...sessionState }),
  getTimeRemaining: () => timeRemaining.value
})

// Watchers
watch(() => props.enabled, (newValue) => {
  if (newValue && !sessionState.isActive) {
    initializeSession()
  } else if (!newValue && sessionState.isActive) {
    cleanupSession()
  }
})

// Lifecycle
onMounted(() => {
  if (props.enabled) {
    initializeSession()
  }
})

onUnmounted(() => {
  cleanupSession()
})
</script>

<style scoped>
.session-manager {
  position: relative;
  min-height: 100vh;
}

.session-content {
  position: relative;
  z-index: 10;
}

/* Activity indicator animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.activity-indicator {
  animation: pulse 2s infinite;
}

/* Session status animations */
.session-status-enter-active,
.session-status-leave-active {
  transition: all 0.3s ease;
}

.session-status-enter-from,
.session-status-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
