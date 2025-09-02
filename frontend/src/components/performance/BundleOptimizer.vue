<template>
  <div class="bundle-optimizer">
    <!-- Bundle Analysis Dashboard -->
    <div 
      v-if="showDashboard"
      class="bundle-dashboard"
      :class="dashboardClass"
    >
      <div class="dashboard-header">
        <h3 class="dashboard-title">Bundle Optimizer</h3>
        <div class="dashboard-actions">
          <button 
            @click="analyzeBundle"
            class="action-btn analyze"
            :disabled="isAnalyzing"
            title="Analyze bundle"
          >
            <ChartBarIcon class="w-4 h-4" />
          </button>
          <button 
            @click="toggleDashboard"
            class="action-btn toggle"
            title="Hide dashboard"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <!-- Bundle Stats -->
      <div class="bundle-stats">
        <div class="stat-item">
          <span class="stat-label">Total Size:</span>
          <span class="stat-value">{{ formatBytes(bundleStats.totalSize) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Initial Chunk:</span>
          <span class="stat-value">{{ formatBytes(bundleStats.initialChunk) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Chunks:</span>
          <span class="stat-value">{{ bundleStats.chunkCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Modules:</span>
          <span class="stat-value">{{ bundleStats.moduleCount }}</span>
        </div>
      </div>
      
      <!-- Optimization Controls -->
      <div class="optimization-controls">
        <div class="control-group">
          <label class="control-label">Chunk Strategy:</label>
          <select 
            v-model="chunkStrategy"
            class="control-select"
            @change="updateChunkStrategy"
          >
            <option value="route">Route-based</option>
            <option value="component">Component-based</option>
            <option value="vendor">Vendor-based</option>
            <option value="dynamic">Dynamic imports</option>
          </select>
        </div>
        
        <div class="control-group">
          <label class="control-label">Preload Strategy:</label>
          <select 
            v-model="preloadStrategy"
            class="control-select"
            @change="updatePreloadStrategy"
          >
            <option value="none">None</option>
            <option value="visible">Visible routes</option>
            <option value="adjacent">Adjacent routes</option>
            <option value="all">All routes</option>
          </select>
        </div>
        
        <div class="control-group">
          <label class="control-label">Compression:</label>
          <label class="control-checkbox">
            <input 
              v-model="enableCompression"
              type="checkbox"
              @change="updateCompression"
            />
            <span class="checkmark"></span>
            Enable Gzip/Brotli
          </label>
        </div>
      </div>
      
      <!-- Bundle Actions -->
      <div class="bundle-actions">
        <button 
          @click="optimizeBundle"
          class="action-btn optimize"
          :disabled="isOptimizing"
        >
          <span v-if="isOptimizing">Optimizing...</span>
          <span v-else>Optimize Bundle</span>
        </button>
        <button 
          @click="exportBundleReport"
          class="action-btn export"
        >
          Export Report
        </button>
        <button 
          @click="showBundleDetails = !showBundleDetails"
          class="action-btn details"
        >
          {{ showBundleDetails ? 'Hide' : 'Show' }} Details
        </button>
      </div>
      
      <!-- Bundle Details -->
      <div 
        v-if="showBundleDetails"
        class="bundle-details"
      >
        <div class="detail-section">
          <h4 class="detail-title">Chunk Analysis</h4>
          <div class="chunk-list">
            <div 
              v-for="chunk in bundleStats.chunks"
              :key="chunk.name"
              class="chunk-item"
            >
              <div class="chunk-header">
                <span class="chunk-name">{{ chunk.name }}</span>
                <span class="chunk-size">{{ formatBytes(chunk.size) }}</span>
              </div>
              <div class="chunk-modules">
                <span class="module-count">{{ chunk.modules.length }} modules</span>
                <span class="chunk-type">{{ chunk.type }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4 class="detail-title">Module Analysis</h4>
          <div class="module-list">
            <div 
              v-for="module in bundleStats.modules.slice(0, 10)"
              :key="module.name"
              class="module-item"
            >
              <span class="module-name">{{ module.name }}</span>
              <span class="module-size">{{ formatBytes(module.size) }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4 class="detail-title">Performance Metrics</h4>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">First Paint:</span>
              <span class="metric-value">{{ bundleStats.metrics.firstPaint }}ms</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">First Contentful Paint:</span>
              <span class="metric-value">{{ bundleStats.metrics.firstContentfulPaint }}ms</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Largest Contentful Paint:</span>
              <span class="metric-value">{{ bundleStats.metrics.largestContentfulPaint }}ms</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Time to Interactive:</span>
              <span class="metric-value">{{ bundleStats.metrics.timeToInteractive }}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bundle Toggle Button -->
    <button 
      v-if="!showDashboard"
      @click="toggleDashboard"
      class="bundle-toggle-btn"
      :class="bundleStatusClass"
      :title="`Bundle: ${bundleStatusText}`"
    >
      <CubeIcon class="w-5 h-5" />
    </button>
    
    <!-- Main Content -->
    <div class="bundle-content">
      <slot 
        :bundle-stats="bundleStats"
        :chunk-strategy="chunkStrategy"
        :preload-strategy="preloadStrategy"
        :enable-compression="enableCompression"
        :analyze-bundle="analyzeBundle"
        :optimize-bundle="optimizeBundle"
        :get-bundle-report="getBundleReport"
        :bundle-status="bundleStatus"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  CubeIcon,
  XMarkIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  // Bundle configuration
  chunkStrategy: {
    type: String,
    default: 'route'
  },
  preloadStrategy: {
    type: String,
    default: 'visible'
  },
  enableCompression: {
    type: Boolean,
    default: true
  },
  
  // UI configuration
  showDashboard: {
    type: Boolean,
    default: false
  },
  dashboardClass: {
    type: String,
    default: ''
  },
  
  // Analysis configuration
  enableAnalysis: {
    type: Boolean,
    default: true
  },
  analysisInterval: {
    type: Number,
    default: 30000 // 30 seconds
  }
})

// Emits
const emit = defineEmits([
  'bundle-analyzed',
  'bundle-optimized',
  'chunk-strategy-changed',
  'preload-strategy-changed',
  'compression-changed',
  'bundle-stats-update'
])

// Reactive state
const showDashboard = ref(props.showDashboard)
const showBundleDetails = ref(false)
const isAnalyzing = ref(false)
const isOptimizing = ref(false)
const chunkStrategy = ref(props.chunkStrategy)
const preloadStrategy = ref(props.preloadStrategy)
const enableCompression = ref(props.enableCompression)

// Bundle statistics
const bundleStats = reactive({
  totalSize: 0,
  initialChunk: 0,
  chunkCount: 0,
  moduleCount: 0,
  chunks: [],
  modules: [],
  metrics: {
    firstPaint: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    timeToInteractive: 0
  },
  lastAnalysis: null
})

// Analysis interval
let analysisInterval = null

// Computed properties
const bundleStatus = computed(() => {
  const size = bundleStats.totalSize
  if (size === 0) return 'unknown'
  if (size < 500 * 1024) return 'excellent' // < 500KB
  if (size < 1024 * 1024) return 'good' // < 1MB
  if (size < 2 * 1024 * 1024) return 'fair' // < 2MB
  return 'poor' // > 2MB
})

const bundleStatusClass = computed(() => {
  const status = bundleStatus.value
  return `status-${status}`
})

const bundleStatusText = computed(() => {
  const status = bundleStatus.value
  const size = formatBytes(bundleStats.totalSize)
  return `${status} (${size})`
})

// Methods
const analyzeBundle = async () => {
  if (isAnalyzing.value) return
  
  isAnalyzing.value = true
  
  try {
    // Simulate bundle analysis
    await simulateBundleAnalysis()
    
    // Update last analysis timestamp
    bundleStats.lastAnalysis = Date.now()
    
    // Emit event
    emit('bundle-analyzed', {
      stats: bundleStats,
      timestamp: Date.now()
    })
    
  } finally {
    isAnalyzing.value = false
  }
}

const simulateBundleAnalysis = async () => {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Generate sample bundle stats
  const totalSize = Math.random() * 2 * 1024 * 1024 + 500 * 1024 // 500KB - 2.5MB
  const initialChunk = totalSize * 0.4
  const chunkCount = Math.floor(Math.random() * 10) + 5
  const moduleCount = Math.floor(Math.random() * 100) + 50
  
  // Generate chunks
  const chunks = []
  for (let i = 0; i < chunkCount; i++) {
    const chunkSize = (totalSize - initialChunk) / (chunkCount - 1)
    chunks.push({
      name: `chunk-${i}`,
      size: i === 0 ? initialChunk : chunkSize,
      type: i === 0 ? 'initial' : 'async',
      modules: []
    })
  }
  
  // Generate modules
  const modules = []
  for (let i = 0; i < moduleCount; i++) {
    modules.push({
      name: `module-${i}`,
      size: Math.random() * 50 * 1024 + 10 * 1024 // 10KB - 60KB
    })
  }
  
  // Generate performance metrics
  const metrics = {
    firstPaint: Math.floor(Math.random() * 200) + 100,
    firstContentfulPaint: Math.floor(Math.random() * 300) + 150,
    largestContentfulPaint: Math.floor(Math.random() * 800) + 400,
    timeToInteractive: Math.floor(Math.random() * 1000) + 500
  }
  
  // Update bundle stats
  Object.assign(bundleStats, {
    totalSize,
    initialChunk,
    chunkCount,
    moduleCount,
    chunks,
    modules,
    metrics
  })
}

const optimizeBundle = async () => {
  if (isOptimizing.value) return
  
  isOptimizing.value = true
  
  try {
    // Simulate optimization
    await simulateBundleOptimization()
    
    // Emit event
    emit('bundle-optimized', {
      stats: bundleStats,
      timestamp: Date.now()
    })
    
  } finally {
    isOptimizing.value = false
  }
}

const simulateBundleOptimization = async () => {
  // Simulate optimization delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Apply optimization strategies
  if (chunkStrategy.value === 'route') {
    // Route-based optimization
    bundleStats.totalSize *= 0.85 // 15% reduction
    bundleStats.initialChunk *= 0.8 // 20% reduction
  } else if (chunkStrategy.value === 'component') {
    // Component-based optimization
    bundleStats.totalSize *= 0.9 // 10% reduction
    bundleStats.initialChunk *= 0.85 // 15% reduction
  } else if (chunkStrategy.value === 'vendor') {
    // Vendor-based optimization
    bundleStats.totalSize *= 0.8 // 20% reduction
    bundleStats.initialChunk *= 0.75 // 25% reduction
  }
  
  // Update chunk sizes proportionally
  bundleStats.chunks.forEach((chunk, index) => {
    if (index === 0) {
      chunk.size = bundleStats.initialChunk
    } else {
      chunk.size = (bundleStats.totalSize - bundleStats.initialChunk) / (bundleStats.chunkCount - 1)
    }
  })
  
  // Improve performance metrics
  bundleStats.metrics.firstPaint *= 0.8
  bundleStats.metrics.firstContentfulPaint *= 0.8
  bundleStats.metrics.largestContentfulPaint *= 0.8
  bundleStats.metrics.timeToInteractive *= 0.8
}

const updateChunkStrategy = () => {
  emit('chunk-strategy-changed', {
    strategy: chunkStrategy.value,
    timestamp: Date.now()
  })
  
  // Trigger re-analysis
  if (bundleStats.lastAnalysis) {
    analyzeBundle()
  }
}

const updatePreloadStrategy = () => {
  emit('preload-strategy-changed', {
    strategy: preloadStrategy.value,
    timestamp: Date.now()
  })
}

const updateCompression = () => {
  emit('compression-changed', {
    enabled: enableCompression.value,
    timestamp: Date.now()
  })
}

const toggleDashboard = () => {
  showDashboard.value = !showDashboard.value
}

const exportBundleReport = () => {
  const report = getBundleReport()
  const dataStr = JSON.stringify(report, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `bundle-report-${Date.now()}.json`
  link.click()
}

const getBundleReport = () => {
  return {
    timestamp: Date.now(),
    stats: bundleStats,
    configuration: {
      chunkStrategy: chunkStrategy.value,
      preloadStrategy: preloadStrategy.value,
      enableCompression: enableCompression.value
    },
    recommendations: generateRecommendations()
  }
}

const generateRecommendations = () => {
  const recommendations = []
  
  if (bundleStats.totalSize > 1024 * 1024) {
    recommendations.push('Consider implementing code splitting to reduce bundle size')
  }
  
  if (bundleStats.initialChunk > 500 * 1024) {
    recommendations.push('Initial chunk is large, consider lazy loading non-critical components')
  }
  
  if (bundleStats.chunkCount < 3) {
    recommendations.push('Consider splitting into more chunks for better caching')
  }
  
  if (bundleStats.metrics.timeToInteractive > 1000) {
    recommendations.push('Time to interactive is high, consider optimizing critical rendering path')
  }
  
  return recommendations
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Code splitting utilities
const createAsyncComponent = (importFunc, options = {}) => {
  return defineAsyncComponent({
    loader: importFunc,
    loadingComponent: options.loadingComponent,
    errorComponent: options.errorComponent,
    delay: options.delay || 200,
    timeout: options.timeout || 3000,
    onError: options.onError
  })
}

const createRouteChunk = (routeName, componentPath) => {
  return {
    path: `/${routeName}`,
    name: routeName,
    component: () => import(componentPath)
  }
}

const createComponentChunk = (componentName, componentPath) => {
  return createAsyncComponent(() => import(componentPath), {
    name: componentName
  })
}

const createVendorChunk = (chunkName, modules) => {
  return {
    name: chunkName,
    modules,
    strategy: 'vendor'
  }
}

// Preloading strategies
const preloadRoute = (routeName) => {
  if (preloadStrategy.value === 'none') return
  
  // Implement route preloading logic
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = `/js/chunk-${routeName}.js`
  document.head.appendChild(link)
}

const preloadComponent = (componentName) => {
  if (preloadStrategy.value === 'none') return
  
  // Implement component preloading logic
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = `/js/component-${componentName}.js`
  document.head.appendChild(link)
}

// Monitoring
const startAnalysisInterval = () => {
  if (!props.enableAnalysis) return
  
  analysisInterval = setInterval(() => {
    // Auto-analyze bundle periodically
    if (bundleStats.lastAnalysis && 
        Date.now() - bundleStats.lastAnalysis > props.analysisInterval) {
      analyzeBundle()
    }
    
    // Emit stats update
    emit('bundle-stats-update', getBundleReport())
    
  }, props.analysisInterval)
}

const stopAnalysisInterval = () => {
  if (analysisInterval) {
    clearInterval(analysisInterval)
    analysisInterval = null
  }
}

// Lifecycle
onMounted(() => {
  startAnalysisInterval()
  
  // Initial analysis
  if (props.enableAnalysis) {
    analyzeBundle()
  }
})

onUnmounted(() => {
  stopAnalysisInterval()
})

// Expose methods
defineExpose({
  bundleStats: computed(() => bundleStats),
  chunkStrategy: computed(() => chunkStrategy.value),
  preloadStrategy: computed(() => preloadStrategy.value),
  enableCompression: computed(() => enableCompression.value),
  analyzeBundle,
  optimizeBundle,
  getBundleReport,
  bundleStatus: computed(() => bundleStatus.value),
  createAsyncComponent,
  createRouteChunk,
  createComponentChunk,
  createVendorChunk,
  preloadRoute,
  preloadComponent
})
</script>

<style scoped>
.bundle-optimizer {
  position: relative;
}

.bundle-dashboard {
  position: fixed;
  top: 4rem;
  right: 1rem;
  width: 360px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  font-size: 0.875rem;
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.dashboard-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.dashboard-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.analyze {
  background: #3b82f6;
  color: white;
}

.action-btn.analyze:hover {
  background: #2563eb;
}

.action-btn.analyze:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.toggle {
  background: #6b7280;
  color: white;
}

.action-btn.toggle:hover {
  background: #4b5563;
}

.bundle-stats {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  color: #111827;
  font-weight: 600;
}

.optimization-controls {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.control-group {
  margin-bottom: 1rem;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-label {
  display: block;
  color: #6b7280;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.control-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.control-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.875rem;
}

.control-checkbox input[type="checkbox"] {
  margin-right: 0.5rem;
}

.bundle-actions {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn.optimize,
.action-btn.export,
.action-btn.details {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.action-btn.optimize:hover,
.action-btn.export:hover,
.action-btn.details:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.action-btn.optimize:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bundle-details {
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.chunk-list {
  space-y: 0.5rem;
}

.chunk-item {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
}

.chunk-item:last-child {
  margin-bottom: 0;
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.chunk-name {
  font-weight: 500;
  color: #111827;
  font-size: 0.75rem;
}

.chunk-size {
  font-weight: 600;
  color: #059669;
  font-size: 0.75rem;
}

.chunk-modules {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.625rem;
  color: #6b7280;
}

.module-list {
  max-height: 200px;
  overflow-y: auto;
}

.module-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.75rem;
}

.module-item:last-child {
  border-bottom: none;
}

.module-name {
  color: #111827;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 0.5rem;
}

.module-size {
  color: #6b7280;
  font-weight: 500;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  font-size: 0.75rem;
}

.metric-label {
  color: #6b7280;
}

.metric-value {
  color: #111827;
  font-weight: 600;
}

.bundle-toggle-btn {
  position: fixed;
  top: 4rem;
  right: 1rem;
  width: 3rem;
  height: 3rem;
  border: none;
  border-radius: 50%;
  background: #6b7280;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.bundle-toggle-btn:hover {
  transform: scale(1.1);
}

.bundle-toggle-btn.status-excellent {
  background: #10b981;
}

.bundle-toggle-btn.status-good {
  background: #3b82f6;
}

.bundle-toggle-btn.status-fair {
  background: #f59e0b;
}

.bundle-toggle-btn.status-poor {
  background: #ef4444;
}

.bundle-toggle-btn.status-unknown {
  background: #6b7280;
}

.bundle-content {
  width: 100%;
}

/* Responsive design */
@media (max-width: 640px) {
  .bundle-dashboard {
    width: calc(100vw - 2rem);
    right: 1rem;
    left: 1rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
