<template>
  <div class="performance-monitor">
    <!-- Performance metrics display (only in development) -->
    <div v-if="showMetrics && isDevelopment" class="metrics-panel">
      <div class="metrics-header">
        <h3 class="metrics-title">Performance Metrics</h3>
        <button
          @click="showMetrics = false"
          class="close-metrics"
          aria-label="Close metrics panel"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="metrics-content">
        <!-- Core Web Vitals -->
        <div class="metric-section">
          <h4 class="section-title">Core Web Vitals</h4>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">LCP</span>
              <span :class="['metric-value', getLCPClass()]">{{ formatTime(metrics.lcp) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">FID</span>
              <span :class="['metric-value', getFIDClass()]">{{ formatTime(metrics.fid) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">CLS</span>
              <span :class="['metric-value', getCLSClass()]">{{ formatCLS(metrics.cls) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Performance Timing -->
        <div class="metric-section">
          <h4 class="section-title">Timing</h4>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">DOM Load</span>
              <span class="metric-value">{{ formatTime(metrics.domLoad) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Page Load</span>
              <span class="metric-value">{{ formatTime(metrics.pageLoad) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">First Paint</span>
              <span class="metric-value">{{ formatTime(metrics.firstPaint) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Memory Usage -->
        <div class="metric-section">
          <h4 class="section-title">Memory</h4>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">Used</span>
              <span class="metric-value">{{ formatBytes(metrics.memoryUsed) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Total</span>
              <span class="metric-value">{{ formatBytes(metrics.memoryTotal) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Limit</span>
              <span class="metric-value">{{ formatBytes(metrics.memoryLimit) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Network -->
        <div class="metric-section">
          <h4 class="section-title">Network</h4>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">Requests</span>
              <span class="metric-value">{{ metrics.networkRequests }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Cache Hits</span>
              <span class="metric-value">{{ metrics.cacheHits }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Errors</span>
              <span class="metric-value">{{ metrics.networkErrors }}</span>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="metric-actions">
          <button
            @click="refreshMetrics"
            class="action-button"
          >
            Refresh
          </button>
          <button
            @click="exportMetrics"
            class="action-button"
          >
            Export
          </button>
          <button
            @click="clearMetrics"
            class="action-button"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
    
    <!-- Performance toggle button (only in development) -->
    <button
      v-if="isDevelopment"
      @click="showMetrics = !showMetrics"
      class="metrics-toggle"
      :class="{ 'metrics-toggle-active': showMetrics }"
      aria-label="Toggle performance metrics"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, provide } from 'vue'

// Props
const props = defineProps({
  enableMonitoring: {
    type: Boolean,
    default: true
  },
  enableReporting: {
    type: Boolean,
    default: false
  },
  reportEndpoint: {
    type: String,
    default: '/api/performance'
  }
})

// Reactive state
const showMetrics = ref(false)
const isDevelopment = ref(process.env.NODE_ENV === 'development')

// Performance metrics
const metrics = reactive({
  // Core Web Vitals
  lcp: 0,
  fid: 0,
  cls: 0,
  
  // Timing
  domLoad: 0,
  pageLoad: 0,
  firstPaint: 0,
  
  // Memory
  memoryUsed: 0,
  memoryTotal: 0,
  memoryLimit: 0,
  
  // Network
  networkRequests: 0,
  cacheHits: 0,
  networkErrors: 0,
  
  // Custom metrics
  componentLoadTimes: {},
  userInteractions: [],
  errors: []
})

// Performance observers
let lcpObserver = null
let fidObserver = null
let clsObserver = null
let memoryObserver = null

// Performance context
const performanceContext = {
  // Track component load time
  trackComponentLoad: (componentName, loadTime) => {
    metrics.componentLoadTimes[componentName] = loadTime
  },
  
  // Track user interaction
  trackInteraction: (type, target, duration) => {
    metrics.userInteractions.push({
      type,
      target,
      duration,
      timestamp: Date.now()
    })
  },
  
  // Track error
  trackError: (error, context) => {
    metrics.errors.push({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    })
  },
  
  // Get current metrics
  getMetrics: () => ({ ...metrics }),
  
  // Report metrics to server
  reportMetrics: async () => {
    if (!props.enableReporting) return
    
    try {
      const response = await fetch(props.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metrics: { ...metrics },
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to report metrics')
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to report performance metrics:', error)
    }
  }
}

// Provide performance context to child components
provide('performance', performanceContext)

// Core Web Vitals observers
const setupCoreWebVitals = () => {
  if (!props.enableMonitoring) return
  
  // Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      metrics.lcp = lastEntry.startTime
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    
    // First Input Delay (FID)
    fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        metrics.fid = Math.min(metrics.fid || Infinity, entry.processingStart - entry.startTime)
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    
    // Cumulative Layout Shift (CLS)
    clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          metrics.cls += entry.value
        }
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  }
}

// Memory monitoring
const setupMemoryMonitoring = () => {
  if (!props.enableMonitoring || !performance.memory) return
  
  const updateMemoryMetrics = () => {
    metrics.memoryUsed = performance.memory.usedJSHeapSize
    metrics.memoryTotal = performance.memory.totalJSHeapSize
    metrics.memoryLimit = performance.memory.jsHeapSizeLimit
  }
  
  updateMemoryMetrics()
  memoryObserver = setInterval(updateMemoryMetrics, 5000)
}

// Network monitoring
const setupNetworkMonitoring = () => {
  if (!props.enableMonitoring) return
  
  // Track fetch requests
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    const startTime = performance.now()
    metrics.networkRequests++
    
    try {
      const response = await originalFetch(...args)
      const endTime = performance.now()
      
      // Check if response came from cache
      if (response.headers.get('x-cache') === 'HIT') {
        metrics.cacheHits++
      }
      
      return response
    } catch (error) {
      metrics.networkErrors++
      throw error
    }
  }
}

// Performance timing
const setupPerformanceTiming = () => {
  if (!props.enableMonitoring) return
  
  // DOM load time
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      metrics.domLoad = performance.now()
    })
  } else {
    metrics.domLoad = performance.now()
  }
  
  // Page load time
  window.addEventListener('load', () => {
    metrics.pageLoad = performance.now()
  })
  
  // First paint
  if ('PerformanceObserver' in window) {
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'first-paint') {
          metrics.firstPaint = entry.startTime
        }
      })
    })
    paintObserver.observe({ entryTypes: ['paint'] })
  }
}

// Utility methods
const formatTime = (time) => {
  if (!time) return 'N/A'
  return `${Math.round(time)}ms`
}

const formatCLS = (cls) => {
  if (!cls) return 'N/A'
  return cls.toFixed(3)
}

const formatBytes = (bytes) => {
  if (!bytes) return 'N/A'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const getLCPClass = () => {
  if (metrics.lcp <= 2500) return 'text-green-600'
  if (metrics.lcp <= 4000) return 'text-yellow-600'
  return 'text-red-600'
}

const getFIDClass = () => {
  if (metrics.fid <= 100) return 'text-green-600'
  if (metrics.fid <= 300) return 'text-yellow-600'
  return 'text-red-600'
}

const getCLSClass = () => {
  if (metrics.cls <= 0.1) return 'text-green-600'
  if (metrics.cls <= 0.25) return 'text-yellow-600'
  return 'text-red-600'
}

// Actions
const refreshMetrics = () => {
  // Recalculate current metrics
  if (performance.memory) {
    metrics.memoryUsed = performance.memory.usedJSHeapSize
    metrics.memoryTotal = performance.memory.totalJSHeapSize
    metrics.memoryLimit = performance.memory.jsHeapSizeLimit
  }
}

const exportMetrics = () => {
  const dataStr = JSON.stringify(metrics, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `performance-metrics-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

const clearMetrics = () => {
  Object.assign(metrics, {
    lcp: 0,
    fid: 0,
    cls: 0,
    domLoad: 0,
    pageLoad: 0,
    firstPaint: 0,
    memoryUsed: 0,
    memoryTotal: 0,
    memoryLimit: 0,
    networkRequests: 0,
    cacheHits: 0,
    networkErrors: 0,
    componentLoadTimes: {},
    userInteractions: [],
    errors: []
  })
}

// Lifecycle
onMounted(() => {
  if (props.enableMonitoring) {
    setupCoreWebVitals()
    setupMemoryMonitoring()
    setupNetworkMonitoring()
    setupPerformanceTiming()
  }
})

onUnmounted(() => {
  // Cleanup observers
  if (lcpObserver) lcpObserver.disconnect()
  if (fidObserver) fidObserver.disconnect()
  if (clsObserver) clsObserver.disconnect()
  if (memoryObserver) clearInterval(memoryObserver)
})
</script>

<style scoped>
.performance-monitor {
  @apply relative;
}

.metrics-panel {
  @apply fixed top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-w-sm;
}

.metrics-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.metrics-title {
  @apply text-lg font-semibold text-gray-900;
}

.close-metrics {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

.metrics-content {
  @apply p-4 max-h-96 overflow-y-auto;
}

.metric-section {
  @apply mb-6;
}

.section-title {
  @apply text-sm font-medium text-gray-700 mb-3;
}

.metrics-grid {
  @apply space-y-2;
}

.metric-item {
  @apply flex items-center justify-between;
}

.metric-label {
  @apply text-sm text-gray-600;
}

.metric-value {
  @apply text-sm font-mono font-medium;
}

.metric-actions {
  @apply flex gap-2 pt-4 border-t border-gray-200;
}

.action-button {
  @apply px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors;
}

.metrics-toggle {
  @apply fixed bottom-4 right-4 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40;
}

.metrics-toggle-active {
  @apply bg-green-600 hover:bg-green-700;
}

/* Responsive design */
@media (max-width: 640px) {
  .metrics-panel {
    @apply top-2 right-2 left-2 max-w-none;
  }
  
  .metrics-toggle {
    @apply bottom-2 right-2;
  }
}
</style>
