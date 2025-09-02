<template>
  <div class="accessibility-provider">
    <!-- Skip to main content link -->
    <a
      href="#main-content"
      class="skip-link"
      :class="{ 'skip-link-visible': showSkipLink }"
      @focus="showSkipLink = true"
      @blur="showSkipLink = false"
    >
      Skip to main content
    </a>

    <!-- High contrast mode indicator -->
    <div
      v-if="highContrastMode"
      class="high-contrast-indicator"
      role="status"
      aria-live="polite"
    >
      High contrast mode enabled
    </div>

    <!-- Screen reader announcements -->
    <div
      ref="announcements"
      class="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ announcement }}
    </div>

    <!-- Main content -->
    <div id="main-content" class="main-content">
      <slot />
    </div>

    <!-- Keyboard navigation help modal -->
    <div
      v-if="showKeyboardHelp"
      class="keyboard-help-modal"
      role="dialog"
      aria-labelledby="keyboard-help-title"
      aria-describedby="keyboard-help-description"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="keyboard-help-title" class="modal-title">Keyboard Navigation</h2>
          <button
            @click="showKeyboardHelp = false"
            class="close-button"
            aria-label="Close keyboard help"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div id="keyboard-help-description" class="modal-body">
          <div class="keyboard-shortcuts">
            <h3 class="shortcuts-title">Keyboard Shortcuts</h3>
            <div class="shortcuts-grid">
              <div class="shortcut-item">
                <kbd class="keyboard-key">Tab</kbd>
                <span>Navigate between interactive elements</span>
              </div>
              <div class="shortcut-item">
                <kbd class="keyboard-key">Enter</kbd>
                <span>Activate buttons and links</span>
              </div>
              <div class="shortcut-item">
                <kbd class="keyboard-key">Space</kbd>
                <span>Toggle checkboxes and radio buttons</span>
              </div>
              <div class="shortcut-item">
                <kbd class="keyboard-key">Escape</kbd>
                <span>Close modals and dialogs</span>
              </div>
              <div class="shortcut-item">
                <kbd class="keyboard-key">H</kbd>
                <span>Go to home page</span>
              </div>
              <div class="shortcut-item">
                <kbd class="keyboard-key">?</kbd>
                <span>Show this help (when available)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  enableHighContrast: {
    type: Boolean,
    default: false
  },
  enableReducedMotion: {
    type: Boolean,
    default: false
  },
  enableKeyboardNavigation: {
    type: Boolean,
    default: true
  }
})

// Reactive state
const showSkipLink = ref(false)
const showKeyboardHelp = ref(false)
const highContrastMode = ref(false)
const reducedMotionMode = ref(false)
const announcement = ref('')
const announcements = ref(null)

// Accessibility context
const accessibilityContext = {
  announce: (message) => {
    announcement.value = message
    // Clear after a short delay to allow screen readers to process
    setTimeout(() => {
      announcement.value = ''
    }, 1000)
  },
  
  setHighContrast: (enabled) => {
    highContrastMode.value = enabled
    document.documentElement.classList.toggle('high-contrast', enabled)
  },
  
  setReducedMotion: (enabled) => {
    reducedMotionMode.value = enabled
    document.documentElement.classList.toggle('reduced-motion', enabled)
  },
  
  focusFirstInteractive: () => {
    const firstInteractive = document.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (firstInteractive) {
      firstInteractive.focus()
    }
  },
  
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }
}

// Provide accessibility context to child components
provide('accessibility', accessibilityContext)

// Keyboard event handlers
const handleKeydown = (event) => {
  // Show keyboard help with ? key
  if (event.key === '?' && !showKeyboardHelp.value) {
    event.preventDefault()
    showKeyboardHelp.value = true
  }
  
  // Close keyboard help with Escape
  if (event.key === 'Escape' && showKeyboardHelp.value) {
    showKeyboardHelp.value = false
  }
  
  // Navigation shortcuts
  if (event.key === 'h' || event.key === 'H') {
    // Navigate to home (implement based on your routing)
    console.log('Navigate to home')
  }
}

// Check user preferences
const checkUserPreferences = () => {
  // Check for high contrast preference
  const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
  highContrastMode.value = highContrastQuery.matches || props.enableHighContrast
  
  // Check for reduced motion preference
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotionMode.value = reducedMotionQuery.matches || props.enableReducedMotion
  
  // Apply preferences
  accessibilityContext.setHighContrast(highContrastMode.value)
  accessibilityContext.setReducedMotion(reducedMotionMode.value)
}

// Focus management
const handleFocusIn = (event) => {
  // Add focus indicator
  event.target.classList.add('focus-visible')
}

const handleFocusOut = (event) => {
  // Remove focus indicator
  event.target.classList.remove('focus-visible')
}

// Lifecycle
onMounted(() => {
  // Check user preferences
  checkUserPreferences()
  
  // Add event listeners
  if (props.enableKeyboardNavigation) {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
  }
  
  // Announce page load
  accessibilityContext.announce('Page loaded successfully')
  
  // Set up media query listeners
  const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  
  highContrastQuery.addEventListener('change', (e) => {
    accessibilityContext.setHighContrast(e.matches)
  })
  
  reducedMotionQuery.addEventListener('change', (e) => {
    accessibilityContext.setReducedMotion(e.matches)
  })
})

onUnmounted(() => {
  // Remove event listeners
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('focusin', handleFocusIn)
  document.removeEventListener('focusout', handleFocusOut)
})
</script>

<style scoped>
.accessibility-provider {
  @apply relative;
}

.skip-link {
  @apply absolute top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg opacity-0 pointer-events-none transition-opacity duration-200;
}

.skip-link:focus {
  @apply opacity-100 pointer-events-auto;
}

.skip-link-visible {
  @apply opacity-100 pointer-events-auto;
}

.high-contrast-indicator {
  @apply fixed top-4 right-4 z-50 px-3 py-1 bg-yellow-500 text-black text-sm rounded-lg;
}

.main-content {
  @apply outline-none;
}

.keyboard-help-modal {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50;
}

.modal-content {
  @apply bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900;
}

.close-button {
  @apply p-2 text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-6;
}

.shortcuts-title {
  @apply text-lg font-medium text-gray-900 mb-4;
}

.shortcuts-grid {
  @apply space-y-3;
}

.shortcut-item {
  @apply flex items-center gap-3;
}

.keyboard-key {
  @apply px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono;
}

.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
}

/* Focus management styles */
:global(.focus-visible) {
  @apply outline-2 outline-blue-500 outline-offset-2;
}

/* High contrast mode styles */
:global(.high-contrast) {
  @apply contrast-200;
}

:global(.high-contrast *) {
  @apply border-gray-900;
}

/* Reduced motion styles */
:global(.reduced-motion *) {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Responsive design */
@media (max-width: 640px) {
  .skip-link {
    @apply top-2 left-2;
  }
  
  .high-contrast-indicator {
    @apply top-2 right-2;
  }
}
</style>
