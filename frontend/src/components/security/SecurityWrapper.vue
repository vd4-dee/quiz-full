<template>
  <div class="security-wrapper">
    <!-- Security Status Bar -->
    <div 
      v-if="showSecurityStatus"
      class="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 text-center text-sm font-medium shadow-lg"
    >
      <div class="flex items-center justify-center space-x-4">
        <div class="flex items-center space-x-2">
          <ShieldCheckIcon class="w-4 h-4" />
          <span>Security System Active</span>
        </div>
        
        <div class="flex items-center space-x-4 text-xs">
          <div class="flex items-center space-x-1">
            <div class="w-2 h-2 rounded-full" :class="getSecurityIndicatorClass('antiCheating')"></div>
            <span>Anti-Cheat</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-2 h-2 rounded-full" :class="getSecurityIndicatorClass('session')"></div>
            <span>Session</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-2 h-2 rounded-full" :class="getSecurityIndicatorClass('validation')"></div>
            <span>Validation</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-2 h-2 rounded-full" :class="getSecurityIndicatorClass('rateLimit')"></div>
            <span>Rate Limit</span>
          </div>
        </div>
        
        <div class="text-xs">
          {{ getOverallSecurityStatus() }}
        </div>
      </div>
    </div>

    <!-- Security Dashboard Toggle -->
    <button 
      @click="toggleSecurityDashboard"
      class="fixed top-20 right-4 z-40 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
      :title="showSecurityDashboard ? 'Hide Security Dashboard' : 'Show Security Dashboard'"
    >
      <ShieldCheckIcon class="w-5 h-5" />
    </button>

    <!-- Security Dashboard -->
    <div 
      v-if="showSecurityDashboard"
      class="fixed top-24 right-4 z-40 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm w-80"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Security Dashboard</h3>
        <button 
          @click="toggleSecurityDashboard"
          class="text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
      
      <div class="space-y-4">
        <!-- Anti-Cheating Status -->
        <div class="bg-gray-50 p-3 rounded-md">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-medium text-gray-900">Anti-Cheating</h4>
            <span :class="getStatusBadgeClass(securityStatus.antiCheating)">
              {{ securityStatus.antiCheating }}
            </span>
          </div>
          <div class="text-xs text-gray-600">
            <div>Violations: {{ securityMetrics.antiCheating.violations }}</div>
            <div>Fullscreen: {{ securityMetrics.antiCheating.fullscreen ? 'Enforced' : 'Optional' }}</div>
          </div>
        </div>
        
        <!-- Session Management Status -->
        <div class="bg-gray-50 p-3 rounded-md">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-medium text-gray-900">Session Management</h4>
            <span :class="getStatusBadgeClass(securityStatus.session)">
              {{ securityStatus.session }}
            </span>
          </div>
          <div class="text-xs text-gray-600">
            <div>Time Remaining: {{ formatTimeRemaining(securityMetrics.session.timeRemaining) }}</div>
            <div>Extensions: {{ securityMetrics.session.extensionsUsed }}/{{ securityMetrics.session.maxExtensions }}</div>
          </div>
        </div>
        
        <!-- Input Validation Status -->
        <div class="bg-gray-50 p-3 rounded-md">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-medium text-gray-900">Input Validation</h4>
            <span :class="getStatusBadgeClass(securityStatus.validation)">
              {{ securityStatus.validation }}
            </span>
          </div>
          <div class="text-xs text-gray-600">
            <div>Threats Detected: {{ securityMetrics.validation.securityThreats }}</div>
            <div>Fields Validated: {{ securityMetrics.validation.fieldsValidated }}</div>
          </div>
        </div>
        
        <!-- Rate Limiting Status -->
        <div class="bg-gray-50 p-3 rounded-md">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-medium text-gray-900">Rate Limiting</h4>
            <span :class="getStatusBadgeClass(securityStatus.rateLimit)">
              {{ securityStatus.rateLimit }}
            </span>
          </div>
          <div class="text-xs text-gray-600">
            <div>Requests: {{ securityMetrics.rateLimit.currentRequests }}/{{ securityMetrics.rateLimit.maxRequests }}</div>
            <div>Blocked: {{ securityMetrics.rateLimit.blockedRequests }}</div>
          </div>
        </div>
        
        <!-- Security Actions -->
        <div class="pt-3 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-2">
            <button 
              @click="refreshSecurityStatus"
              class="px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
            >
              Refresh
            </button>
            <button 
              @click="showSecuritySettings"
              class="px-3 py-2 border border-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-50"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content with Security Components -->
    <div class="security-content">
      <!-- Anti-Cheating Wrapper -->
      <AntiCheating 
        :enabled="securityConfig.antiCheating.enabled"
        :quiz-duration="securityConfig.antiCheating.quizDuration"
        :strict-mode="securityConfig.antiCheating.strictMode"
        :show-controls="securityConfig.antiCheating.showControls"
        @security-violation="handleSecurityViolation"
        @fullscreen-change="handleFullscreenChange"
        @session-locked="handleSessionLocked"
        @security-status-change="handleAntiCheatingStatusChange"
      >
        <!-- Session Manager Wrapper -->
        <SessionManager 
          :enabled="securityConfig.session.enabled"
          :session-timeout="securityConfig.session.timeout"
          :warning-threshold="securityConfig.session.warningThreshold"
          :show-status="securityConfig.session.showStatus"
          :show-activity="securityConfig.session.showActivity"
          :auto-extend="securityConfig.session.autoExtend"
          :max-extensions="securityConfig.session.maxExtensions"
          @session-warning="handleSessionWarning"
          @session-expired="handleSessionExpired"
          @session-extended="handleSessionExtended"
          @session-activity="handleSessionActivity"
          @session-status-change="handleSessionStatusChange"
        >
          <!-- Input Validator Wrapper -->
          <InputValidator 
            :enabled="securityConfig.validation.enabled"
            :strict-mode="securityConfig.validation.strictMode"
            :show-status="securityConfig.validation.showStatus"
            :show-errors="securityConfig.validation.showErrors"
            :show-summary="securityConfig.validation.showSummary"
            :auto-validate="securityConfig.validation.autoValidate"
            :max-errors="securityConfig.validation.maxErrors"
            @validation-error="handleValidationError"
            @validation-success="handleValidationSuccess"
            @validation-complete="handleValidationComplete"
            @security-threat="handleSecurityThreat"
            @input-sanitized="handleInputSanitized"
          >
            <!-- Rate Limiter Wrapper -->
            <RateLimiter 
              :enabled="securityConfig.rateLimit.enabled"
              :max-requests="securityConfig.rateLimit.maxRequests"
              :time-window="securityConfig.rateLimit.timeWindow"
              :warning-threshold="securityConfig.rateLimit.warningThreshold"
              :show-status="securityConfig.rateLimit.showStatus"
              :show-dashboard="securityConfig.rateLimit.showDashboard"
              :strict-mode="securityConfig.rateLimit.strictMode"
              :auto-retry="securityConfig.rateLimit.autoRetry"
              :retry-delay="securityConfig.rateLimit.retryDelay"
              @rate-limit-warning="handleRateLimitWarning"
              @rate-limit-exceeded="handleRateLimitExceeded"
              @rate-limit-reset="handleRateLimitReset"
              @request-blocked="handleRequestBlocked"
              @rate-limit-status-change="handleRateLimitStatusChange"
            >
              <!-- Main Content Slot -->
              <slot 
                :security-status="securityStatus"
                :security-metrics="securityMetrics"
                :security-config="securityConfig"
                :refresh-security="refreshSecurityStatus"
                :update-security-config="updateSecurityConfig"
                :get-security-report="getSecurityReport"
              />
            </RateLimiter>
          </InputValidator>
        </SessionManager>
      </AntiCheating>
    </div>

    <!-- Security Settings Modal -->
    <div 
      v-if="showSecuritySettingsModal"
      class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Security Settings</h3>
          <button 
            @click="showSecuritySettingsModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <div class="space-y-6">
          <!-- Anti-Cheating Settings -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-3">Anti-Cheating</h4>
            <div class="space-y-3">
              <label class="flex items-center">
                <input 
                  v-model="securityConfig.antiCheating.enabled"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Enable anti-cheating measures</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="securityConfig.antiCheating.strictMode"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Strict mode (enforce fullscreen)</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="securityConfig.antiCheating.showControls"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Show security controls</span>
              </label>
            </div>
          </div>
          
          <!-- Session Management Settings -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-3">Session Management</h4>
            <div class="space-y-3">
              <label class="flex items-center">
                <input 
                  v-model="securityConfig.session.enabled"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Enable session management</span>
              </label>
              <div>
                <label class="block text-sm text-gray-700 mb-1">Session Timeout (minutes)</label>
                <input 
                  v-model.number="securityConfig.session.timeout"
                  type="number"
                  min="5"
                  max="480"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-1">Warning Threshold (minutes)</label>
                <input 
                  v-model.number="securityConfig.session.warningThreshold"
                  type="number"
                  min="1"
                  max="30"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
          
          <!-- Input Validation Settings -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-3">Input Validation</h4>
            <div class="space-y-3">
              <label class="flex items-center">
                <input 
                  v-model="securityConfig.validation.enabled"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Enable input validation</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="securityConfig.validation.strictMode"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Strict validation mode</span>
              </label>
              <label class="flex items-center">
                <input 
                  v-model="securityConfig.validation.autoValidate"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Auto-validate inputs</span>
              </label>
            </div>
          </div>
          
          <!-- Rate Limiting Settings -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-3">Rate Limiting</h4>
            <div class="space-y-3">
              <label class="flex items-center">
                <input 
                  v-model="securityConfig.rateLimit.enabled"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm">Enable rate limiting</span>
              </label>
              <div>
                <label class="block text-sm text-gray-700 mb-1">Max Requests</label>
                <input 
                  v-model.number="securityConfig.rateLimit.maxRequests"
                  type="number"
                  min="10"
                  max="10000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-1">Time Window (hours)</label>
                <input 
                  v-model.number="timeWindowHours"
                  type="number"
                  min="0.1"
                  max="24"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button 
            @click="resetSecurityConfig"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Reset to Defaults
          </button>
          <button 
            @click="saveSecurityConfig"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  ShieldCheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import AntiCheating from './AntiCheating.vue'
import SessionManager from './SessionManager.vue'
import InputValidator from './InputValidator.vue'
import RateLimiter from './RateLimiter.vue'

// Props
const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  showStatus: {
    type: Boolean,
    default: true
  },
  showDashboard: {
    type: Boolean,
    default: false
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits([
  'security-status-change',
  'security-violation',
  'security-threat',
  'session-expired',
  'rate-limit-exceeded'
])

// Reactive state
const showSecurityStatus = ref(props.showStatus)
const showSecurityDashboard = ref(props.showDashboard)
const showSecuritySettingsModal = ref(false)

// Security configuration
const securityConfig = reactive({
  antiCheating: {
    enabled: true,
    quizDuration: 60,
    strictMode: false,
    showControls: true
  },
  session: {
    enabled: true,
    timeout: 30,
    warningThreshold: 5,
    showStatus: true,
    showActivity: true,
    autoExtend: true,
    maxExtensions: 3
  },
  validation: {
    enabled: true,
    strictMode: false,
    showStatus: true,
    showErrors: true,
    showSummary: false,
    autoValidate: true,
    maxErrors: 10
  },
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    timeWindow: 3600000, // 1 hour
    warningThreshold: 0.8,
    showStatus: true,
    showDashboard: false,
    strictMode: false,
    autoRetry: true,
    retryDelay: 5000
  }
})

// Security status
const securityStatus = reactive({
  antiCheating: 'active',
  session: 'active',
  validation: 'active',
  rateLimit: 'active'
})

// Security metrics
const securityMetrics = reactive({
  antiCheating: {
    violations: 0,
    fullscreen: false
  },
  session: {
    timeRemaining: 0,
    extensionsUsed: 0,
    maxExtensions: 3
  },
  validation: {
    securityThreats: 0,
    fieldsValidated: 0
  },
  rateLimit: {
    currentRequests: 0,
    maxRequests: 100,
    blockedRequests: 0
  }
})

// Computed properties
const timeWindowHours = computed({
  get: () => securityConfig.rateLimit.timeWindow / 3600000,
  set: (value) => {
    securityConfig.rateLimit.timeWindow = value * 3600000
  }
})

const overallSecurityStatus = computed(() => {
  const statuses = Object.values(securityStatus)
  if (statuses.every(status => status === 'active')) return 'secure'
  if (statuses.some(status => status === 'warning')) return 'warning'
  if (statuses.some(status => status === 'error')) return 'error'
  return 'inactive'
})

// Methods
const toggleSecurityDashboard = () => {
  showSecurityDashboard.value = !showSecurityDashboard.value
}

const showSecuritySettings = () => {
  showSecuritySettingsModal.value = true
}

const refreshSecurityStatus = () => {
  // This would typically refresh all security components
  emit('security-status-change', {
    status: 'refreshed',
    timestamp: Date.now(),
    overallStatus: overallSecurityStatus.value
  })
}

const updateSecurityConfig = (newConfig) => {
  Object.assign(securityConfig, newConfig)
  
  // Save to localStorage
  localStorage.setItem('security-config', JSON.stringify(securityConfig))
  
  emit('security-status-change', {
    status: 'config_updated',
    timestamp: Date.now(),
    config: securityConfig
  })
}

const saveSecurityConfig = () => {
  localStorage.setItem('security-config', JSON.stringify(securityConfig))
  showSecuritySettingsModal.value = false
  
  emit('security-status-change', {
    status: 'config_saved',
    timestamp: Date.now(),
    config: securityConfig
  })
}

const resetSecurityConfig = () => {
  // Reset to default values
  Object.assign(securityConfig, {
    antiCheating: { enabled: true, quizDuration: 60, strictMode: false, showControls: true },
    session: { enabled: true, timeout: 30, warningThreshold: 5, showStatus: true, showActivity: true, autoExtend: true, maxExtensions: 3 },
    validation: { enabled: true, strictMode: false, showStatus: true, showErrors: true, showSummary: false, autoValidate: true, maxErrors: 10 },
    rateLimit: { enabled: true, maxRequests: 100, timeWindow: 3600000, warningThreshold: 0.8, showStatus: true, showDashboard: false, strictMode: false, autoRetry: true, retryDelay: 5000 }
  })
  
  localStorage.removeItem('security-config')
}

const getSecurityReport = () => {
  return {
    timestamp: Date.now(),
    overallStatus: overallSecurityStatus.value,
    status: securityStatus,
    metrics: securityMetrics,
    config: securityConfig
  }
}

// Event handlers
const handleSecurityViolation = (violation) => {
  securityMetrics.antiCheating.violations++
  
  emit('security-violation', {
    ...violation,
    component: 'antiCheating',
    timestamp: Date.now()
  })
}

const handleFullscreenChange = (isFullscreen) => {
  securityMetrics.antiCheating.fullscreen = isFullscreen
}

const handleSessionLocked = (data) => {
  emit('session-expired', {
    ...data,
    component: 'session',
    timestamp: Date.now()
  })
}

const handleAntiCheatingStatusChange = (data) => {
  securityStatus.antiCheating = data.active ? 'active' : 'inactive'
}

const handleSessionWarning = (data) => {
  securityStatus.session = 'warning'
}

const handleSessionExpired = (data) => {
  securityStatus.session = 'error'
  emit('session-expired', {
    ...data,
    component: 'session',
    timestamp: Date.now()
  })
}

const handleSessionExtended = (data) => {
  securityMetrics.session.extensionsUsed = data.extensionsUsed
  securityStatus.session = 'active'
}

const handleSessionActivity = (data) => {
  // Update session metrics
}

const handleSessionStatusChange = (data) => {
  if (data.status === 'active') {
    securityStatus.session = 'active'
  } else if (data.status === 'expired') {
    securityStatus.session = 'error'
  }
}

const handleValidationError = (data) => {
  securityMetrics.validation.fieldsValidated++
}

const handleValidationSuccess = (data) => {
  securityMetrics.validation.fieldsValidated++
}

const handleValidationComplete = (data) => {
  securityStatus.validation = data.isValid ? 'active' : 'warning'
}

const handleSecurityThreat = (data) => {
  securityMetrics.validation.securityThreats += data.threats.length
  securityStatus.validation = 'warning'
  
  emit('security-threat', {
    ...data,
    component: 'validation',
    timestamp: Date.now()
  })
}

const handleInputSanitized = (data) => {
  // Handle sanitized input
}

const handleRateLimitWarning = (data) => {
  securityStatus.rateLimit = 'warning'
}

const handleRateLimitExceeded = (data) => {
  securityStatus.rateLimit = 'error'
  emit('rate-limit-exceeded', {
    ...data,
    component: 'rateLimit',
    timestamp: Date.now()
  })
}

const handleRateLimitReset = (data) => {
  securityStatus.rateLimit = 'active'
}

const handleRequestBlocked = (data) => {
  securityMetrics.rateLimit.blockedRequests++
}

const handleRateLimitStatusChange = (data) => {
  if (data.status === 'initialized') {
    securityStatus.rateLimit = 'active'
  } else if (data.status === 'request_made') {
    securityMetrics.rateLimit.currentRequests = data.currentRequests
  }
}

// Utility methods
const getSecurityIndicatorClass = (component) => {
  const status = securityStatus[component]
  switch (status) {
    case 'active': return 'bg-green-500'
    case 'warning': return 'bg-yellow-500'
    case 'error': return 'bg-red-500'
    default: return 'bg-gray-400'
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full'
    case 'warning': return 'bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full'
    case 'error': return 'bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full'
    default: return 'bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full'
  }
}

const getOverallSecurityStatus = () => {
  switch (overallSecurityStatus.value) {
    case 'secure': return 'All systems secure'
    case 'warning': return 'Security warnings detected'
    case 'error': return 'Security issues detected'
    default: return 'Security system inactive'
  }
}

const formatTimeRemaining = (ms) => {
  if (!ms || ms <= 0) return 'Expired'
  
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Load configuration from localStorage
const loadSecurityConfig = () => {
  const savedConfig = localStorage.getItem('security-config')
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig)
      Object.assign(securityConfig, parsed)
    } catch (error) {
      console.error('Error loading security config:', error)
    }
  }
}

// Watchers
watch(() => props.enabled, (newValue) => {
  if (!newValue) {
    showSecurityStatus.value = false
    showSecurityDashboard.value = false
  }
})

// Lifecycle
onMounted(() => {
  loadSecurityConfig()
  
  if (props.enabled) {
    emit('security-status-change', {
      status: 'initialized',
      timestamp: Date.now(),
      config: securityConfig
    })
  }
})

onUnmounted(() => {
  // Cleanup
})
</script>

<style scoped>
.security-wrapper {
  position: relative;
  min-height: 100vh;
}

.security-content {
  position: relative;
  z-index: 10;
}

/* Security status bar animations */
.security-status-enter-active,
.security-status-leave-active {
  transition: all 0.3s ease;
}

.security-status-enter-from,
.security-status-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

/* Dashboard animations */
.dashboard-enter-active,
.dashboard-leave-active {
  transition: all 0.3s ease;
}

.dashboard-enter-from,
.dashboard-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Settings modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Security indicator animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.security-indicator {
  animation: pulse 2s infinite;
}
</style>
