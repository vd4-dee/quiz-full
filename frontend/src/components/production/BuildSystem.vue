<template>
  <div class="build-system">
    <!-- Build Dashboard -->
    <div 
      v-if="showDashboard"
      class="build-dashboard"
      :class="dashboardClass"
    >
      <div class="dashboard-header">
        <h3 class="dashboard-title">Production Build System</h3>
        <div class="dashboard-actions">
          <button 
            @click="startBuild"
            class="action-btn build"
            :disabled="isBuilding"
            title="Start build"
          >
            <PlayIcon class="w-4 h-4" />
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
      
      <!-- Build Status -->
      <div class="build-status">
        <div class="status-item">
          <span class="status-label">Status:</span>
          <span class="status-value" :class="buildStatusClass">{{ buildStatusText }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Last Build:</span>
          <span class="status-value">{{ lastBuildTime || 'Never' }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Build Count:</span>
          <span class="status-value">{{ buildCount }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Success Rate:</span>
          <span class="status-value">{{ successRate }}%</span>
        </div>
      </div>
      
      <!-- Environment Configuration -->
      <div class="environment-config">
        <h4 class="config-title">Environment Configuration</h4>
        <div class="config-group">
          <label class="config-label">Environment:</label>
          <select 
            v-model="selectedEnvironment"
            class="config-select"
            @change="updateEnvironment"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>
        
        <div class="config-group">
          <label class="config-label">Build Mode:</label>
          <select 
            v-model="buildMode"
            class="config-select"
            @change="updateBuildMode"
          >
            <option value="development">Development</option>
            <option value="production">Production</option>
            <option value="testing">Testing</option>
          </select>
        </div>
        
        <div class="config-group">
          <label class="config-label">Optimization Level:</label>
          <select 
            v-model="optimizationLevel"
            class="config-select"
            @change="updateOptimizationLevel"
          >
            <option value="low">Low (Fast build)</option>
            <option value="medium">Medium (Balanced)</option>
            <option value="high">High (Slow build)</option>
          </select>
        </div>
      </div>
      
      <!-- Build Actions -->
      <div class="build-actions">
        <button 
          @click="startBuild"
          class="action-btn start"
          :disabled="isBuilding"
        >
          <span v-if="isBuilding">Building...</span>
          <span v-else>Start Build</span>
        </button>
        <button 
          @click="cancelBuild"
          class="action-btn cancel"
          :disabled="!isBuilding"
        >
          Cancel Build
        </button>
        <button 
          @click="showBuildHistory = !showBuildHistory"
          class="action-btn history"
        >
          {{ showBuildHistory ? 'Hide' : 'Show' }} History
        </button>
      </div>
      
      <!-- Build History -->
      <div 
        v-if="showBuildHistory"
        class="build-history"
      >
        <h4 class="history-title">Recent Builds</h4>
        <div class="history-list">
          <div 
            v-for="build in recentBuilds"
            :key="build.id"
            class="history-item"
            :class="build.status"
          >
            <div class="history-header">
              <span class="build-id">#{{ build.id }}</span>
              <span class="build-status">{{ build.status }}</span>
              <span class="build-time">{{ formatTime(build.duration) }}</span>
            </div>
            <div class="history-details">
              <span class="build-env">{{ build.environment }}</span>
              <span class="build-size">{{ formatBytes(build.bundleSize) }}</span>
              <span class="build-date">{{ formatDate(build.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Build Toggle Button -->
    <button 
      v-if="!showDashboard"
      @click="toggleDashboard"
      class="build-toggle-btn"
      :class="buildStatusClass"
      :title="`Build: ${buildStatusText}`"
    >
      <CogIcon class="w-5 h-5" />
    </button>
    
    <!-- Main Content -->
    <div class="build-content">
      <slot 
        :build-status="buildStatus"
        :is-building="isBuilding"
        :selected-environment="selectedEnvironment"
        :build-mode="buildMode"
        :optimization-level="optimizationLevel"
        :start-build="startBuild"
        :cancel-build="cancelBuild"
        :get-build-report="getBuildReport"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  CogIcon,
  XMarkIcon,
  PlayIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  // Build configuration
  environment: {
    type: String,
    default: 'development'
  },
  buildMode: {
    type: String,
    default: 'development'
  },
  optimizationLevel: {
    type: String,
    default: 'medium'
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
  
  // Build configuration
  enableAutoBuild: {
    type: Boolean,
    default: false
  },
  buildInterval: {
    type: Number,
    default: 300000 // 5 minutes
  }
})

// Emits
const emit = defineEmits([
  'build-started',
  'build-completed',
  'build-failed',
  'build-cancelled',
  'environment-changed',
  'build-mode-changed',
  'optimization-level-changed'
])

// Reactive state
const showDashboard = ref(props.showDashboard)
const showBuildHistory = ref(false)
const isBuilding = ref(false)
const selectedEnvironment = ref(props.environment)
const buildMode = ref(props.buildMode)
const optimizationLevel = ref(props.optimizationLevel)

// Build state
const buildStatus = ref('idle')
const buildCount = ref(0)
const successCount = ref(0)
const lastBuildTime = ref(null)
const currentBuild = ref(null)

// Build history
const recentBuilds = ref([])

// Build interval
let buildInterval = null

// Computed properties
const buildStatusClass = computed(() => {
  return `status-${buildStatus.value}`
})

const buildStatusText = computed(() => {
  const status = buildStatus.value
  const statusMap = {
    idle: 'Ready',
    building: 'Building...',
    success: 'Success',
    failed: 'Failed',
    cancelled: 'Cancelled'
  }
  return statusMap[status] || status
})

const successRate = computed(() => {
  if (buildCount.value === 0) return 0
  return Math.round((successCount.value / buildCount.value) * 100)
})

// Methods
const startBuild = async () => {
  if (isBuilding.value) return
  
  isBuilding.value = true
  buildStatus.value = 'building'
  
  // Create build record
  const buildId = Date.now()
  currentBuild.value = {
    id: buildId,
    startTime: Date.now(),
    environment: selectedEnvironment.value,
    mode: buildMode.value,
    optimization: optimizationLevel.value
  }
  
  emit('build-started', currentBuild.value)
  
  try {
    // Simulate build process
    await simulateBuild()
    
    // Build successful
    buildStatus.value = 'success'
    buildCount.value++
    successCount.value++
    lastBuildTime.value = new Date().toLocaleString()
    
    // Add to history
    addBuildToHistory({
      ...currentBuild.value,
      status: 'success',
      endTime: Date.now(),
      bundleSize: Math.random() * 2 * 1024 * 1024 + 500 * 1024 // 500KB - 2.5MB
    })
    
    emit('build-completed', {
      ...currentBuild.value,
      status: 'success',
      duration: Date.now() - currentBuild.value.startTime
    })
    
  } catch (error) {
    // Build failed
    buildStatus.value = 'failed'
    buildCount.value++
    
    // Add to history
    addBuildToHistory({
      ...currentBuild.value,
      status: 'failed',
      endTime: Date.now(),
      error: error.message
    })
    
    emit('build-failed', {
      ...currentBuild.value,
      error: error.message
    })
    
  } finally {
    isBuilding.value = false
    currentBuild.value = null
  }
}

const cancelBuild = () => {
  if (!isBuilding.value) return
  
  buildStatus.value = 'cancelled'
  isBuilding.value = false
  
  // Add to history
  addBuildToHistory({
    ...currentBuild.value,
    status: 'cancelled',
    endTime: Date.now()
  })
  
  emit('build-cancelled', currentBuild.value)
  currentBuild.value = null
}

const simulateBuild = async () => {
  // Simulate build delay based on optimization level
  const delays = {
    low: 2000,
    medium: 5000,
    high: 10000
  }
  
  const delay = delays[optimizationLevel.value] || 5000
  
  // Simulate build steps
  const steps = [
    'Installing dependencies...',
    'Compiling TypeScript...',
    'Bundling assets...',
    'Optimizing bundle...',
    'Generating build files...',
    'Running tests...',
    'Finalizing build...'
  ]
  
  for (let i = 0; i < steps.length; i++) {
    // Simulate step delay
    await new Promise(resolve => setTimeout(resolve, delay / steps.length))
    
    // Random failure chance (5%)
    if (Math.random() < 0.05) {
      throw new Error(`Build failed at step: ${steps[i]}`)
    }
  }
}

const addBuildToHistory = (build) => {
  const buildRecord = {
    id: build.id,
    status: build.status,
    environment: build.environment,
    mode: build.mode,
    optimization: build.optimization,
    timestamp: build.startTime,
    duration: build.endTime - build.startTime,
    bundleSize: build.bundleSize || 0,
    error: build.error
  }
  
  recentBuilds.value.unshift(buildRecord)
  
  // Keep only last 10 builds
  if (recentBuilds.value.length > 10) {
    recentBuilds.value = recentBuilds.value.slice(0, 10)
  }
}

const updateEnvironment = () => {
  emit('environment-changed', {
    environment: selectedEnvironment.value,
    timestamp: Date.now()
  })
}

const updateBuildMode = () => {
  emit('build-mode-changed', {
    mode: buildMode.value,
    timestamp: Date.now()
  })
}

const updateOptimizationLevel = () => {
  emit('optimization-level-changed', {
    level: optimizationLevel.value,
    timestamp: Date.now()
  })
}

const toggleDashboard = () => {
  showDashboard.value = !showDashboard.value
}

const getBuildReport = () => {
  return {
    timestamp: Date.now(),
    status: buildStatus.value,
    count: buildCount.value,
    successRate: successRate.value,
    lastBuild: lastBuildTime.value,
    environment: selectedEnvironment.value,
    mode: buildMode.value,
    optimization: optimizationLevel.value,
    recentBuilds: recentBuilds.value
  }
}

const formatTime = (ms) => {
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Auto-build functionality
const startAutoBuild = () => {
  if (!props.enableAutoBuild) return
  
  buildInterval = setInterval(() => {
    // Auto-build logic
    if (buildStatus.value === 'idle' && selectedEnvironment.value === 'production') {
      startBuild()
    }
  }, props.buildInterval)
}

const stopAutoBuild = () => {
  if (buildInterval) {
    clearInterval(buildInterval)
    buildInterval = null
  }
}

// Lifecycle
onMounted(() => {
  startAutoBuild()
})

onUnmounted(() => {
  stopAutoBuild()
})

// Expose methods
defineExpose({
  buildStatus: computed(() => buildStatus.value),
  isBuilding: computed(() => isBuilding.value),
  selectedEnvironment: computed(() => selectedEnvironment.value),
  buildMode: computed(() => buildMode.value),
  optimizationLevel: computed(() => optimizationLevel.value),
  startBuild,
  cancelBuild,
  getBuildReport
})
</script>

<style scoped>
.build-system {
  position: relative;
}

.build-dashboard {
  position: fixed;
  top: 4rem;
  right: 1rem;
  width: 400px;
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

.action-btn.build {
  background: #10b981;
  color: white;
}

.action-btn.build:hover {
  background: #059669;
}

.action-btn.build:disabled {
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

.build-status {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.status-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-label {
  color: #6b7280;
  font-weight: 500;
}

.status-value {
  color: #111827;
  font-weight: 600;
}

.status-value.status-success {
  color: #059669;
}

.status-value.status-failed {
  color: #dc2626;
}

.status-value.status-building {
  color: #2563eb;
}

.status-value.status-cancelled {
  color: #f59e0b;
}

.environment-config {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.config-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.config-group {
  margin-bottom: 0.75rem;
}

.config-group:last-child {
  margin-bottom: 0;
}

.config-label {
  display: block;
  color: #6b7280;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.config-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.build-actions {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn.start,
.action-btn.cancel,
.action-btn.history {
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

.action-btn.start {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.action-btn.start:hover {
  background: #059669;
  border-color: #059669;
}

.action-btn.start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.cancel {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.action-btn.cancel:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.action-btn.cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.history:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.build-history {
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
}

.history-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid #e5e7eb;
}

.history-item:last-child {
  margin-bottom: 0;
}

.history-item.success {
  border-left-color: #10b981;
}

.history-item.failed {
  border-left-color: #ef4444;
}

.history-item.cancelled {
  border-left-color: #f59e0b;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.build-id {
  font-weight: 600;
  color: #111827;
  font-size: 0.75rem;
}

.build-status {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
}

.build-status.success {
  background: #d1fae5;
  color: #065f46;
}

.build-status.failed {
  background: #fee2e2;
  color: #991b1b;
}

.build-status.cancelled {
  background: #fef3c7;
  color: #92400e;
}

.build-time {
  font-size: 0.625rem;
  color: #6b7280;
  font-weight: 500;
}

.history-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.625rem;
  color: #6b7280;
}

.build-env,
.build-size,
.build-date {
  font-size: 0.625rem;
}

.build-toggle-btn {
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

.build-toggle-btn:hover {
  transform: scale(1.1);
}

.build-toggle-btn.status-success {
  background: #10b981;
}

.build-toggle-btn.status-failed {
  background: #ef4444;
}

.build-toggle-btn.status-building {
  background: #2563eb;
}

.build-toggle-btn.status-cancelled {
  background: #f59e0b;
}

.build-toggle-btn.status-idle {
  background: #6b7280;
}

.build-content {
  width: 100%;
}

/* Responsive design */
@media (max-width: 640px) {
  .build-dashboard {
    width: calc(100vw - 2rem);
    right: 1rem;
    left: 1rem;
  }
}
</style>
