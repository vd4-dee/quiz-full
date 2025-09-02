<template>
  <div class="rate-limiter">
    <!-- Rate Limit Status -->
    <div 
      v-if="showRateLimitStatus"
      class="rate-limit-status"
      :class="getRateLimitStatusClass()"
    >
      <div class="flex items-center space-x-2">
        <component 
          :is="getRateLimitStatusIcon()"
          class="w-4 h-4"
        />
        <span class="text-sm font-medium">{{ getRateLimitStatusText() }}</span>
        <span class="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
          {{ remainingRequests }}/{{ maxRequests }}
        </span>
      </div>
    </div>

    <!-- Rate Limit Warning -->
    <div 
      v-if="showRateLimitWarning"
      class="fixed top-20 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-md p-3 max-w-sm shadow-lg"
    >
      <div class="flex items-center mb-2">
        <ExclamationTriangleIcon class="w-5 h-5 text-yellow-500 mr-2" />
        <h4 class="text-sm font-medium text-yellow-800">Rate Limit Warning</h4>
      </div>
      <p class="text-sm text-yellow-700 mb-2">{{ rateLimitWarningMessage }}</p>
      <div class="text-xs text-yellow-600">
        Reset in: {{ formatTimeRemaining() }}
      </div>
    </div>

    <!-- Rate Limit Exceeded Modal -->
    <div 
      v-if="showRateLimitExceeded"
      class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg max-w-md mx-4 text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-2">Rate Limit Exceeded</h3>
        <p class="text-gray-600 mb-4">{{ rateLimitExceededMessage }}</p>
        
        <div class="space-y-3">
          <div class="text-sm text-gray-500">
            <div>Requests made: {{ totalRequests }}</div>
            <div>Limit: {{ maxRequests }} per {{ formatTimeWindow() }}</div>
            <div>Reset time: {{ formatResetTime() }}</div>
          </div>
          
          <div class="flex space-x-3">
            <button 
              @click="handleRateLimitExceeded"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Acknowledge
            </button>
            <button 
              @click="requestRateLimitIncrease"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Request Increase
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="limiter-content">
      <slot 
        :checkRateLimit="checkRateLimit"
        :makeRequest="makeRequest"
        :getRateLimitInfo="getRateLimitInfo"
        :isRateLimited="isRateLimited"
        :rateLimitState="rateLimitState"
      />
    </div>

    <!-- Rate Limit Dashboard -->
    <div 
      v-if="showRateLimitDashboard"
      class="fixed bottom-4 right-4 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm"
    >
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-900">Rate Limit Monitor</h4>
        <button 
          @click="showRateLimitDashboard = false"
          class="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
      
      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Current Usage:</span>
          <span class="font-medium">{{ remainingRequests }}/{{ maxRequests }}</span>
        </div>
        
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div 
            :class="getUsageBarClass()"
            class="h-2 rounded-full transition-all duration-300"
            :style="{ width: `${getUsagePercentage()}%` }"
          ></div>
        </div>
        
        <div class="flex justify-between text-xs text-gray-500">
          <span>Reset: {{ formatResetTime() }}</span>
          <span>{{ getUsagePercentage() }}%</span>
        </div>
        
        <div class="pt-2 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-600">Total:</span>
              <span class="font-medium ml-1">{{ totalRequests }}</span>
            </div>
            <div>
              <span class="text-gray-600">Blocked:</span>
              <span class="font-medium ml-1">{{ blockedRequests }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  maxRequests: {
    type: Number,
    default: 100
  },
  timeWindow: {
    type: Number,
    default: 3600000 // 1 hour in milliseconds
  },
  warningThreshold: {
    type: Number,
    default: 0.8 // 80% of limit
  },
  showStatus: {
    type: Boolean,
    default: true
  },
  showDashboard: {
    type: Boolean,
    default: false
  },
  strictMode: {
    type: Boolean,
    default: false
  },
  autoRetry: {
    type: Boolean,
    default: true
  },
  retryDelay: {
    type: Number,
    default: 5000 // 5 seconds
  }
})

// Emits
const emit = defineEmits([
  'rate-limit-warning',
  'rate-limit-exceeded',
  'rate-limit-reset',
  'request-blocked',
  'rate-limit-status-change'
])

// Reactive state
const showRateLimitStatus = ref(props.showStatus)
const showRateLimitWarning = ref(false)
const showRateLimitExceeded = ref(false)
const showRateLimitDashboard = ref(props.showDashboard)
const rateLimitWarningMessage = ref('')
const rateLimitExceededMessage = ref('')

// Rate limit state
const rateLimitState = reactive({
  isActive: false,
  currentRequests: 0,
  totalRequests: 0,
  blockedRequests: 0,
  lastRequestTime: null,
  windowStartTime: null,
  resetTime: null,
  isBlocked: false,
  blockUntil: null,
  retryQueue: [],
  requestHistory: []
})

// Timers
let resetTimer = null
let retryTimer = null
let cleanupTimer = null

// Rate limit configuration
const rateLimitConfig = reactive({
  burstLimit: Math.floor(props.maxRequests * 0.1), // 10% burst allowance
  gradualDecay: true,
  adaptiveLimiting: true,
  userSpecific: false,
  ipBased: false
})

// Computed properties
const remainingRequests = computed(() => {
  return Math.max(0, props.maxRequests - rateLimitState.currentRequests)
})

const isRateLimited = computed(() => {
  return rateLimitState.isBlocked || 
         rateLimitState.currentRequests >= props.maxRequests ||
         (rateLimitState.blockUntil && Date.now() < rateLimitState.blockUntil)
})

const usagePercentage = computed(() => {
  return (rateLimitState.currentRequests / props.maxRequests) * 100
})

const isWarningThreshold = computed(() => {
  return usagePercentage.value >= (props.warningThreshold * 100)
})

// Methods
const initializeRateLimiter = () => {
  if (!props.enabled) return
  
  rateLimitState.isActive = true
  rateLimitState.windowStartTime = Date.now()
  rateLimitState.resetTime = Date.now() + props.timeWindow
  
  emit('rate-limit-status-change', {
    status: 'initialized',
    maxRequests: props.maxRequests,
    timeWindow: props.timeWindow
  })
  
  // Start reset timer
  startResetTimer()
  
  // Start cleanup timer
  startCleanupTimer()
}

const startResetTimer = () => {
  const timeUntilReset = rateLimitState.resetTime - Date.now()
  
  resetTimer = setTimeout(() => {
    resetRateLimit()
  }, timeUntilReset)
}

const startCleanupTimer = () => {
  cleanupTimer = setInterval(() => {
    cleanupOldRequests()
  }, 60000) // Clean up every minute
}

const resetRateLimit = () => {
  rateLimitState.currentRequests = 0
  rateLimitState.windowStartTime = Date.now()
  rateLimitState.resetTime = Date.now() + props.timeWindow
  rateLimitState.isBlocked = false
  rateLimitState.blockUntil = null
  
  // Clear retry queue
  rateLimitState.retryQueue = []
  
  emit('rate-limit-reset', {
    timestamp: Date.now(),
    newResetTime: rateLimitState.resetTime
  })
  
  // Restart reset timer
  startResetTimer()
}

const cleanupOldRequests = () => {
  const cutoffTime = Date.now() - props.timeWindow
  
  // Remove old requests from history
  rateLimitState.requestHistory = rateLimitState.requestHistory.filter(
    request => request.timestamp > cutoffTime
  )
  
  // Update current requests count
  rateLimitState.currentRequests = rateLimitState.requestHistory.length
}

const checkRateLimit = (requestType = 'api', priority = 'normal') => {
  if (!props.enabled) return { allowed: true, remaining: Infinity }
  
  // Check if currently blocked
  if (rateLimitState.isBlocked && rateLimitState.blockUntil && Date.now() < rateLimitState.blockUntil) {
    return { 
      allowed: false, 
      remaining: 0, 
      blocked: true, 
      blockUntil: rateLimitState.blockUntil 
    }
  }
  
  // Check burst limit for high priority requests
  if (priority === 'high' && rateLimitState.currentRequests < rateLimitConfig.burstLimit) {
    return { allowed: true, remaining: rateLimitConfig.burstLimit - rateLimitState.currentRequests }
  }
  
  // Check regular rate limit
  if (rateLimitState.currentRequests >= props.maxRequests) {
    return { allowed: false, remaining: 0, exceeded: true }
  }
  
  return { 
    allowed: true, 
    remaining: remainingRequests.value,
    warning: isWarningThreshold.value
  }
}

const makeRequest = async (requestType = 'api', priority = 'normal', retryCount = 0) => {
  if (!props.enabled) return { success: true, rateLimited: false }
  
  const rateLimitCheck = checkRateLimit(requestType, priority)
  
  if (!rateLimitCheck.allowed) {
    if (rateLimitCheck.blocked) {
      handleRateLimitBlocked(rateLimitCheck.blockUntil)
    } else if (rateLimitCheck.exceeded) {
      handleRateLimitExceeded()
    }
    
    // Add to retry queue if auto-retry is enabled
    if (props.autoRetry && retryCount < 3) {
      addToRetryQueue(requestType, priority, retryCount + 1)
    }
    
    return { 
      success: false, 
      rateLimited: true, 
      reason: rateLimitCheck.blocked ? 'blocked' : 'exceeded' 
    }
  }
  
  // Record the request
  recordRequest(requestType, priority)
  
  // Check warning threshold
  if (rateLimitCheck.warning && !showRateLimitWarning.value) {
    showRateLimitWarning.value = true
    rateLimitWarningMessage.value = `You are approaching the rate limit. ${remainingRequests.value} requests remaining.`
    
    emit('rate-limit-warning', {
      remaining: remainingRequests.value,
      percentage: usagePercentage.value,
      timestamp: Date.now()
    })
    
    // Auto-hide warning after 10 seconds
    setTimeout(() => {
      showRateLimitWarning.value = false
    }, 10000)
  }
  
  return { success: true, rateLimited: false, remaining: rateLimitCheck.remaining }
}

const recordRequest = (requestType, priority) => {
  const request = {
    id: generateRequestId(),
    type: requestType,
    priority,
    timestamp: Date.now(),
    success: true
  }
  
  rateLimitState.requestHistory.push(request)
  rateLimitState.currentRequests++
  rateLimitState.totalRequests++
  rateLimitState.lastRequestTime = Date.now()
  
  // Emit status change
  emit('rate-limit-status-change', {
    status: 'request_made',
    currentRequests: rateLimitState.currentRequests,
    remaining: remainingRequests.value,
    request
  })
}

const handleRateLimitExceeded = () => {
  rateLimitState.isBlocked = true
  rateLimitState.blockUntil = Date.now() + (props.retryDelay * 2)
  
  showRateLimitExceeded.value = true
  rateLimitExceededMessage.value = 'You have exceeded the rate limit. Please wait before making more requests.'
  
  emit('rate-limit-exceeded', {
    timestamp: Date.now(),
    currentRequests: rateLimitState.currentRequests,
    maxRequests: props.maxRequests,
    blockUntil: rateLimitState.blockUntil
  })
  
  // Auto-hide after 30 seconds
  setTimeout(() => {
    showRateLimitExceeded.value = false
  }, 30000)
}

const handleRateLimitBlocked = (blockUntil) => {
  rateLimitState.isBlocked = true
  rateLimitState.blockUntil = blockUntil
  
  emit('rate-limit-exceeded', {
    timestamp: Date.now(),
    currentRequests: rateLimitState.currentRequests,
    maxRequests: props.maxRequests,
    blockUntil,
    reason: 'blocked'
  })
}

const addToRetryQueue = (requestType, priority, retryCount) => {
  const retryItem = {
    id: generateRequestId(),
    type: requestType,
    priority,
    retryCount,
    timestamp: Date.now(),
    scheduledFor: Date.now() + (props.retryDelay * retryCount)
  }
  
  rateLimitState.retryQueue.push(retryItem)
  
  // Schedule retry
  setTimeout(() => {
    retryRequest(retryItem)
  }, props.retryDelay * retryCount)
}

const retryRequest = async (retryItem) => {
  // Remove from queue
  const index = rateLimitState.retryQueue.findIndex(item => item.id === retryItem.id)
  if (index > -1) {
    rateLimitState.retryQueue.splice(index, 1)
  }
  
  // Attempt retry
  const result = await makeRequest(retryItem.type, retryItem.priority, retryItem.retryCount)
  
  if (!result.success && retryItem.retryCount < 3) {
    // Add to retry queue again
    addToRetryQueue(retryItem.type, retryItem.priority, retryItem.retryCount + 1)
  }
}

const handleRateLimitExceeded = () => {
  showRateLimitExceeded.value = false
  
  // Reset rate limit state
  rateLimitState.isBlocked = false
  rateLimitState.blockUntil = null
  
  emit('rate-limit-status-change', {
    status: 'acknowledged',
    timestamp: Date.now()
  })
}

const requestRateLimitIncrease = () => {
  // This would typically make an API call to request an increase
  emit('rate-limit-status-change', {
    status: 'increase_requested',
    timestamp: Date.now()
  })
  
  // Show confirmation
  rateLimitExceededMessage.value = 'Rate limit increase request submitted. Please wait for approval.'
}

const getRateLimitInfo = () => {
  return {
    current: rateLimitState.currentRequests,
    max: props.maxRequests,
    remaining: remainingRequests.value,
    percentage: usagePercentage.value,
    resetTime: rateLimitState.resetTime,
    isBlocked: rateLimitState.isBlocked,
    blockUntil: rateLimitState.blockUntil,
    total: rateLimitState.totalRequests,
    blocked: rateLimitState.blockedRequests
  }
}

// Utility methods
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const getRateLimitStatusClass = () => {
  if (isRateLimited.value) return 'bg-red-100 text-red-800 border-red-200'
  if (isWarningThreshold.value) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-green-100 text-green-800 border-green-200'
}

const getRateLimitStatusIcon = () => {
  if (isRateLimited.value) return ExclamationCircleIcon
  if (isWarningThreshold.value) return ClockIcon
  return CheckCircleIcon
}

const getRateLimitStatusText = () => {
  if (isRateLimited.value) return 'Rate Limited'
  if (isWarningThreshold.value) return 'Approaching Limit'
  return 'Rate Limit OK'
}

const getUsageBarClass = () => {
  if (isRateLimited.value) return 'bg-red-500'
  if (isWarningThreshold.value) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getUsagePercentage = () => {
  return Math.min(100, Math.round(usagePercentage.value))
}

const formatTimeRemaining = () => {
  if (!rateLimitState.resetTime) return 'Unknown'
  
  const remaining = rateLimitState.resetTime - Date.now()
  if (remaining <= 0) return 'Now'
  
  const minutes = Math.floor(remaining / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const formatTimeWindow = () => {
  const hours = props.timeWindow / 3600000
  if (hours === 1) return 'hour'
  return `${hours} hours`
}

const formatResetTime = () => {
  if (!rateLimitState.resetTime) return 'Unknown'
  
  const date = new Date(rateLimitState.resetTime)
  return date.toLocaleTimeString()
}

// Public methods (exposed via ref)
const forceReset = () => {
  resetRateLimit()
}

const updateLimits = (newMaxRequests, newTimeWindow) => {
  props.maxRequests = newMaxRequests
  props.timeWindow = newTimeWindow
  resetRateLimit()
}

// Expose methods
defineExpose({
  forceReset,
  updateLimits,
  getRateLimitInfo,
  makeRequest,
  checkRateLimit
})

// Watchers
watch(() => props.enabled, (newValue) => {
  if (newValue && !rateLimitState.isActive) {
    initializeRateLimiter()
  } else if (!newValue && rateLimitState.isActive) {
    cleanup()
  }
})

// Lifecycle
onMounted(() => {
  if (props.enabled) {
    initializeRateLimiter()
  }
})

onUnmounted(() => {
  cleanup()
})

const cleanup = () => {
  if (resetTimer) clearTimeout(resetTimer)
  if (retryTimer) clearTimeout(retryTimer)
  if (cleanupTimer) clearInterval(cleanupTimer)
  
  rateLimitState.isActive = false
}
</script>

<style scoped>
.rate-limiter {
  position: relative;
}

.rate-limit-status {
  position: fixed;
  top-4 left-4 z-50 px-3 py-2 rounded-md border text-sm font-medium shadow-lg
}

.limiter-content {
  position: relative;
  z-index: 10;
}

.rate-limit-warning {
  animation: slideInRight 0.3s ease-out;
}

.rate-limit-exceeded {
  animation: fadeIn 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Usage bar animations */
.usage-bar-enter-active,
.usage-bar-leave-active {
  transition: all 0.3s ease;
}

.usage-bar-enter-from,
.usage-bar-leave-to {
  opacity: 0;
  transform: scaleX(0);
}

/* Dashboard animations */
.dashboard-enter-active,
.dashboard-leave-active {
  transition: all 0.3s ease;
}

.dashboard-enter-from,
.dashboard-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
