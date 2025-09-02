<template>
  <div class="transition-provider">
    <!-- Page transitions -->
    <Transition
      name="page"
      mode="out-in"
      @before-enter="beforeEnter"
      @enter="enter"
      @leave="leave"
    >
      <slot />
    </Transition>

    <!-- Loading overlay -->
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="loading-overlay"
        role="status"
        aria-live="polite"
      >
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">{{ loadingText }}</p>
        </div>
      </div>
    </Transition>

    <!-- Toast notifications -->
    <div class="toast-container">
      <TransitionGroup
        name="toast"
        tag="div"
        class="toast-list"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'toast',
            `toast-${toast.type}`,
            { 'toast-dismissible': toast.dismissible }
          ]"
          role="alert"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        >
          <div class="toast-content">
            <div class="toast-icon">
              <component :is="getToastIcon(toast.type)" />
            </div>
            <div class="toast-message">
              <h4 v-if="toast.title" class="toast-title">{{ toast.title }}</h4>
              <p class="toast-text">{{ toast.message }}</p>
            </div>
            <button
              v-if="toast.dismissible"
              @click="dismissToast(toast.id)"
              class="toast-close"
              aria-label="Dismiss notification"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
  enableAnimations: {
    type: Boolean,
    default: true
  },
  animationDuration: {
    type: Number,
    default: 300
  },
  enableReducedMotion: {
    type: Boolean,
    default: true
  }
})

// Reactive state
const isLoading = ref(false)
const loadingText = ref('Loading...')
const toasts = ref([])
const toastCounter = ref(0)

// Animation context
const animationContext = {
  showLoading: (text = 'Loading...') => {
    loadingText.value = text
    isLoading.value = true
  },
  
  hideLoading: () => {
    isLoading.value = false
  },
  
  showToast: (options) => {
    const toast = {
      id: ++toastCounter.value,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
      dismissible: options.dismissible !== false,
      timestamp: Date.now()
    }
    
    toasts.value.push(toast)
    
    // Auto-dismiss after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        dismissToast(toast.id)
      }, toast.duration)
    }
    
    return toast.id
  },
  
  dismissToast: (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  },
  
  clearToasts: () => {
    toasts.value = []
  },
  
  // Page transition helpers
  beforePageTransition: () => {
    // Add loading state
    this.showLoading()
  },
  
  afterPageTransition: () => {
    // Remove loading state
    this.hideLoading()
  }
}

// Provide animation context to child components
provide('animations', animationContext)

// Toast icon components
const getToastIcon = (type) => {
  const icons = {
    success: 'CheckCircleIcon',
    error: 'ExclamationTriangleIcon',
    warning: 'ExclamationCircleIcon',
    info: 'InformationCircleIcon'
  }
  
  return icons[type] || icons.info
}

// Toast dismiss method
const dismissToast = (id) => {
  animationContext.dismissToast(id)
}

// Page transition handlers
const beforeEnter = (el) => {
  if (!props.enableAnimations) return
  
  el.style.opacity = '0'
  el.style.transform = 'translateY(20px)'
}

const enter = (el, done) => {
  if (!props.enableAnimations) {
    done()
    return
  }
  
  const duration = props.animationDuration
  
  el.style.transition = `all ${duration}ms ease-out`
  
  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  })
  
  setTimeout(done, duration)
}

const leave = (el, done) => {
  if (!props.enableAnimations) {
    done()
    return
  }
  
  const duration = props.animationDuration
  
  el.style.transition = `all ${duration}ms ease-in`
  el.style.opacity = '0'
  el.style.transform = 'translateY(-20px)'
  
  setTimeout(done, duration)
}

// Check for reduced motion preference
const checkReducedMotion = () => {
  if (props.enableReducedMotion) {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reducedMotionQuery.matches) {
      // Disable animations for users who prefer reduced motion
      props.enableAnimations = false
    }
  }
}

// Lifecycle
onMounted(() => {
  checkReducedMotion()
  
  // Set up media query listener for reduced motion
  if (props.enableReducedMotion) {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionQuery.addEventListener('change', (e) => {
      props.enableAnimations = !e.matches
    })
  }
})

onUnmounted(() => {
  // Clear any remaining toasts
  animationContext.clearToasts()
})
</script>

<style scoped>
.transition-provider {
  @apply relative;
}

/* Loading overlay */
.loading-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.loading-content {
  @apply bg-white rounded-lg p-8 text-center;
}

.loading-spinner {
  @apply mb-4;
}

.spinner-ring {
  @apply w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto;
}

.loading-text {
  @apply text-gray-600 font-medium;
}

/* Toast container */
.toast-container {
  @apply fixed top-4 right-4 z-50 space-y-2;
}

.toast-list {
  @apply space-y-2;
}

.toast {
  @apply bg-white rounded-lg shadow-lg border-l-4 p-4 min-w-80 max-w-md;
}

.toast-success {
  @apply border-green-500;
}

.toast-error {
  @apply border-red-500;
}

.toast-warning {
  @apply border-yellow-500;
}

.toast-info {
  @apply border-blue-500;
}

.toast-content {
  @apply flex items-start gap-3;
}

.toast-icon {
  @apply flex-shrink-0 mt-0.5;
}

.toast-message {
  @apply flex-1;
}

.toast-title {
  @apply text-sm font-medium text-gray-900 mb-1;
}

.toast-text {
  @apply text-sm text-gray-600;
}

.toast-close {
  @apply flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease-out;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease-out;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active,
  .toast-enter-active,
  .toast-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
  
  .spinner-ring {
    animation: none;
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .toast-container {
    @apply top-2 right-2 left-2;
  }
  
  .toast {
    @apply min-w-0 max-w-none;
  }
  
  .loading-content {
    @apply p-6 mx-4;
  }
}

/* Animation utilities */
@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInFromTop {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInFromBottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
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

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Animation classes */
.animate-slide-in-right {
  animation: slideInFromRight 0.3s ease-out;
}

.animate-slide-in-left {
  animation: slideInFromLeft 0.3s ease-out;
}

.animate-slide-in-top {
  animation: slideInFromTop 0.3s ease-out;
}

.animate-slide-in-bottom {
  animation: slideInFromBottom 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out;
}
</style>
