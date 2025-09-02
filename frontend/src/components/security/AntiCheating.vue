<template>
  <div 
    ref="securityWrapper"
    class="security-wrapper"
    :class="{ 'fullscreen-mode': isFullscreen }"
  >
    <!-- Security Status Bar -->
    <div 
      v-if="showSecurityBar"
      class="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium"
    >
      <div class="flex items-center justify-center space-x-2">
        <ShieldExclamationIcon class="w-4 h-4" />
        <span>Security Mode Active - Quiz Session Protected</span>
        <span class="text-xs">({{ remainingTime }})</span>
      </div>
    </div>

    <!-- Security Overlay -->
    <div 
      v-if="showSecurityOverlay"
      class="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center"
    >
      <div class="bg-white p-8 rounded-lg text-center max-w-md">
        <ShieldExclamationIcon class="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-2">Security Alert</h3>
        <p class="text-gray-600 mb-4">{{ securityMessage }}</p>
        <button 
          @click="acknowledgeSecurityAlert"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Acknowledge
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="security-content">
      <slot />
    </div>

    <!-- Security Controls -->
    <div 
      v-if="showSecurityControls"
      class="fixed bottom-4 right-4 z-30"
    >
      <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <div class="flex items-center space-x-3">
          <button 
            @click="toggleFullscreen"
            class="p-2 rounded-md hover:bg-gray-100"
            :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
          >
            <component 
              :is="isFullscreen ? 'ArrowsPointingOutIcon' : 'ArrowsPointingInIcon'" 
              class="w-5 h-5 text-gray-600" 
            />
          </button>
          <button 
            @click="lockScreen"
            class="p-2 rounded-md hover:bg-gray-100"
            title="Lock Screen"
          >
            <LockClosedIcon class="w-5 h-5 text-gray-600" />
          </button>
          <button 
            @click="showSecurityInfo"
            class="p-2 rounded-md hover:bg-gray-100"
            title="Security Info"
          >
            <InformationCircleIcon class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { 
  ShieldExclamationIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  LockClosedIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  quizDuration: {
    type: Number,
    default: 0 // in minutes
  },
  strictMode: {
    type: Boolean,
    default: false
  },
  showControls: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'security-violation',
  'fullscreen-change',
  'session-locked',
  'security-status-change'
])

// Reactive state
const securityWrapper = ref(null)
const isFullscreen = ref(false)
const showSecurityBar = ref(false)
const showSecurityOverlay = ref(false)
const showSecurityControls = ref(props.showControls)
const securityMessage = ref('')
const remainingTime = ref('')

// Security state
const securityState = reactive({
  isActive: false,
  violations: [],
  lastActivity: Date.now(),
  fullscreenEnforced: false,
  tabSwitching: false,
  rightClickDisabled: false,
  keyboardShortcuts: false,
  clipboardAccess: false
})

// Timers
let activityTimer = null
let securityCheckTimer = null
let fullscreenCheckTimer = null

// Security configuration
const securityConfig = reactive({
  activityTimeout: 30000, // 30 seconds
  fullscreenCheckInterval: 1000, // 1 second
  securityCheckInterval: 5000, // 5 seconds
  maxViolations: 3,
  violationPenalties: {
    tabSwitch: 10, // 10 seconds penalty
    rightClick: 5, // 5 seconds penalty
    fullscreenExit: 15, // 15 seconds penalty
    inactivity: 20 // 20 seconds penalty
  }
})

// Methods
const initializeSecurity = () => {
  if (!props.enabled) return
  
  securityState.isActive = true
  showSecurityBar.value = true
  emit('security-status-change', { active: true, mode: 'initialized' })
  
  // Start security monitoring
  startSecurityMonitoring()
  
  // Set up event listeners
  setupEventListeners()
  
  // Enforce fullscreen if in strict mode
  if (props.strictMode) {
    enforceFullscreen()
  }
}

const startSecurityMonitoring = () => {
  // Activity monitoring
  activityTimer = setInterval(checkActivity, securityConfig.activityTimeout)
  
  // Security checks
  securityCheckTimer = setInterval(performSecurityChecks, securityConfig.securityCheckInterval)
  
  // Fullscreen monitoring
  fullscreenCheckTimer = setInterval(checkFullscreenStatus, securityConfig.fullscreenCheckInterval)
}

const setupEventListeners = () => {
  // Prevent right-click
  document.addEventListener('contextmenu', preventRightClick)
  
  // Prevent keyboard shortcuts
  document.addEventListener('keydown', preventKeyboardShortcuts)
  
  // Monitor tab switching
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Monitor focus changes
  window.addEventListener('blur', handleWindowBlur)
  window.addEventListener('focus', handleWindowFocus)
  
  // Monitor mouse leave
  document.addEventListener('mouseleave', handleMouseLeave)
  
  // Prevent copy/paste
  document.addEventListener('copy', preventCopyPaste)
  document.addEventListener('paste', preventCopyPaste)
  document.addEventListener('cut', preventCopyPaste)
  
  // Prevent drag and drop
  document.addEventListener('dragstart', preventDragDrop)
  document.addEventListener('drop', preventDragDrop)
}

const preventRightClick = (event) => {
  if (securityState.rightClickDisabled) {
    event.preventDefault()
    recordViolation('rightClick', 'Right-click disabled during quiz')
    return false
  }
}

const preventKeyboardShortcuts = (event) => {
  if (securityState.keyboardShortcuts) {
    // Prevent common shortcuts
    const shortcuts = [
      { key: 'F11', ctrl: false, shift: false, alt: false },
      { key: 'F5', ctrl: false, shift: false, alt: false },
      { key: 'r', ctrl: true, shift: false, alt: false },
      { key: 'n', ctrl: true, shift: false, alt: false },
      { key: 'w', ctrl: true, shift: false, alt: false },
      { key: 't', ctrl: true, shift: false, alt: false },
      { key: 'Tab', ctrl: false, shift: false, alt: true }
    ]
    
    const isShortcut = shortcuts.some(shortcut => 
      event.key.toLowerCase() === shortcut.key.toLowerCase() &&
      event.ctrlKey === shortcut.ctrl &&
      event.shiftKey === shortcut.shift &&
      event.altKey === shortcut.alt
    )
    
    if (isShortcut) {
      event.preventDefault()
      recordViolation('keyboardShortcut', `Keyboard shortcut ${event.key} disabled`)
      return false
    }
  }
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    recordViolation('tabSwitch', 'Tab switching detected')
    showSecurityAlert('Tab switching is not allowed during the quiz. Please return to the quiz tab.')
  }
}

const handleWindowBlur = () => {
  if (props.strictMode) {
    recordViolation('windowBlur', 'Window lost focus')
    showSecurityAlert('Please keep the quiz window focused.')
  }
}

const handleWindowFocus = () => {
  // Reset activity timer
  securityState.lastActivity = Date.now()
}

const handleMouseLeave = () => {
  if (props.strictMode) {
    recordViolation('mouseLeave', 'Mouse left the quiz area')
  }
}

const preventCopyPaste = (event) => {
  if (securityState.clipboardAccess) {
    event.preventDefault()
    recordViolation('clipboardAccess', 'Copy/paste operations disabled')
    return false
  }
}

const preventDragDrop = (event) => {
  event.preventDefault()
  recordViolation('dragDrop', 'Drag and drop operations disabled')
  return false
}

const checkActivity = () => {
  const now = Date.now()
  const timeSinceLastActivity = now - securityState.lastActivity
  
  if (timeSinceLastActivity > securityConfig.activityTimeout) {
    recordViolation('inactivity', 'Inactivity detected')
    showSecurityAlert('Please remain active during the quiz. Inactivity may result in penalties.')
  }
}

const performSecurityChecks = () => {
  // Check for multiple violations
  if (securityState.violations.length >= securityConfig.maxViolations) {
    emit('security-violation', {
      type: 'max_violations_reached',
      violations: securityState.violations,
      action: 'terminate_quiz'
    })
    
    showSecurityAlert('Maximum security violations reached. Quiz will be terminated.')
    terminateQuiz()
  }
  
  // Check for suspicious activity patterns
  const recentViolations = securityState.violations.filter(
    v => Date.now() - v.timestamp < 60000 // Last minute
  )
  
  if (recentViolations.length >= 2) {
    emit('security-violation', {
      type: 'rapid_violations',
      violations: recentViolations,
      action: 'warn_user'
    })
  }
}

const checkFullscreenStatus = () => {
  if (securityState.fullscreenEnforced && !isFullscreen.value) {
    recordViolation('fullscreenExit', 'Fullscreen mode exited')
    enforceFullscreen()
  }
}

const recordViolation = (type, description) => {
  const violation = {
    type,
    description,
    timestamp: Date.now(),
    severity: getViolationSeverity(type)
  }
  
  securityState.violations.push(violation)
  
  emit('security-violation', violation)
  
  // Apply penalty if configured
  if (securityConfig.violationPenalties[type]) {
    applyPenalty(type, securityConfig.violationPenalties[type])
  }
}

const getViolationSeverity = (type) => {
  const severityMap = {
    tabSwitch: 'high',
    fullscreenExit: 'medium',
    rightClick: 'low',
    keyboardShortcut: 'medium',
    inactivity: 'low',
    clipboardAccess: 'medium',
    dragDrop: 'low'
  }
  
  return severityMap[type] || 'low'
}

const applyPenalty = (type, penaltySeconds) => {
  // Add penalty time to quiz duration
  if (props.quizDuration > 0) {
    emit('security-violation', {
      type: 'penalty_applied',
      penaltyType: type,
      penaltySeconds,
      action: 'extend_quiz_time'
    })
  }
}

const showSecurityAlert = (message) => {
  securityMessage.value = message
  showSecurityOverlay.value = true
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    showSecurityOverlay.value = false
  }, 5000)
}

const acknowledgeSecurityAlert = () => {
  showSecurityOverlay.value = false
}

const toggleFullscreen = async () => {
  try {
    if (!isFullscreen.value) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch (error) {
    console.error('Fullscreen error:', error)
    showSecurityAlert('Fullscreen mode not supported by your browser.')
  }
}

const enforceFullscreen = async () => {
  if (props.strictMode && !isFullscreen.value) {
    try {
      await document.documentElement.requestFullscreen()
      securityState.fullscreenEnforced = true
    } catch (error) {
      console.error('Failed to enforce fullscreen:', error)
      showSecurityAlert('Fullscreen mode is required for this quiz.')
    }
  }
}

const lockScreen = () => {
  emit('session-locked', { timestamp: Date.now(), reason: 'manual_lock' })
  showSecurityAlert('Screen locked. Please contact your instructor to unlock.')
}

const showSecurityInfo = () => {
  const info = `
    Security Features Active:
    • Tab switching prevention
    • Right-click disabled
    • Keyboard shortcuts blocked
    • Fullscreen enforcement: ${props.strictMode ? 'Yes' : 'No'}
    • Activity monitoring: Yes
    • Violations: ${securityState.violations.length}/${securityConfig.maxViolations}
  `
  
  showSecurityAlert(info)
}

const terminateQuiz = () => {
  emit('security-violation', {
    type: 'quiz_terminated',
    reason: 'security_violations',
    timestamp: Date.now()
  })
  
  // Clean up and redirect
  cleanup()
}

const cleanup = () => {
  // Clear timers
  if (activityTimer) clearInterval(activityTimer)
  if (securityCheckTimer) clearInterval(securityCheckTimer)
  if (fullscreenCheckTimer) clearInterval(fullscreenCheckTimer)
  
  // Remove event listeners
  document.removeEventListener('contextmenu', preventRightClick)
  document.removeEventListener('keydown', preventKeyboardShortcuts)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  document.removeEventListener('copy', preventCopyPaste)
  document.removeEventListener('paste', preventCopyPaste)
  document.removeEventListener('cut', preventCopyPaste)
  document.removeEventListener('dragstart', preventDragDrop)
  document.removeEventListener('drop', preventDragDrop)
  
  // Exit fullscreen
  if (isFullscreen.value) {
    document.exitFullscreen()
  }
}

// Fullscreen change handler
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
  emit('fullscreen-change', isFullscreen.value)
}

// Activity tracking
const trackActivity = () => {
  securityState.lastActivity = Date.now()
}

// Watchers
watch(() => props.enabled, (newValue) => {
  if (newValue && !securityState.isActive) {
    initializeSecurity()
  } else if (!newValue && securityState.isActive) {
    cleanup()
  }
})

// Lifecycle
onMounted(() => {
  if (props.enabled) {
    initializeSecurity()
  }
  
  // Add fullscreen change listener
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  
  // Track user activity
  document.addEventListener('mousemove', trackActivity)
  document.addEventListener('keydown', trackActivity)
  document.addEventListener('click', trackActivity)
  document.addEventListener('scroll', trackActivity)
})

onUnmounted(() => {
  cleanup()
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('mousemove', trackActivity)
  document.removeEventListener('keydown', trackActivity)
  document.removeEventListener('click', trackActivity)
  document.removeEventListener('scroll', trackActivity)
})
</script>

<style scoped>
.security-wrapper {
  position: relative;
  min-height: 100vh;
}

.security-wrapper.fullscreen-mode {
  background: #000;
}

.security-content {
  position: relative;
  z-index: 10;
}

/* Prevent text selection */
.security-wrapper * {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Security overlay animations */
.security-overlay-enter-active,
.security-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.security-overlay-enter-from,
.security-overlay-leave-to {
  opacity: 0;
}

/* Fullscreen optimizations */
.security-wrapper.fullscreen-mode .security-content {
  background: #fff;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}
</style>
