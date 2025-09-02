<template>
  <div class="load-tester">
    <!-- Load Testing Dashboard -->
    <div 
      v-if="showDashboard"
      class="load-dashboard"
      :class="dashboardClass"
    >
      <div class="dashboard-header">
        <h3 class="dashboard-title">Load Testing System</h3>
        <div class="dashboard-actions">
          <button 
            @click="startLoadTest"
            class="action-btn start"
            :disabled="isTesting"
            title="Start load test"
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
      
      <!-- Test Configuration -->
      <div class="test-config">
        <h4 class="config-title">Test Configuration</h4>
        
        <div class="config-group">
          <label class="config-label">Test Type:</label>
          <select 
            v-model="testType"
            class="config-select"
            @change="updateTestType"
          >
            <option value="stress">Stress Test</option>
            <option value="load">Load Test</option>
            <option value="spike">Spike Test</option>
            <option value="endurance">Endurance Test</option>
          </select>
        </div>
        
        <div class="config-group">
          <label class="config-label">Concurrent Users:</label>
          <div class="range-input">
            <input 
              v-model.number="concurrentUsers"
              type="range"
              min="1"
              max="100"
              class="range-slider"
              @input="updateConcurrentUsers"
            />
            <span class="range-value">{{ concurrentUsers }}</span>
          </div>
        </div>
        
        <div class="config-group">
          <label class="config-label">Test Duration (minutes):</label>
          <div class="range-input">
            <input 
              v-model.number="testDuration"
              type="range"
              min="1"
              max="60"
              class="range-slider"
              @input="updateTestDuration"
            />
            <span class="range-value">{{ testDuration }}m</span>
          </div>
        </div>
        
        <div class="config-group">
          <label class="config-label">Ramp-up Time (seconds):</label>
          <div class="range-input">
            <input 
              v-model.number="rampUpTime"
              type="range"
              min="10"
              max="300"
              class="range-slider"
              @input="updateRampUpTime"
            />
            <span class="range-value">{{ rampUpTime }}s</span>
          </div>
        </div>
      </div>
      
      <!-- Test Status -->
      <div class="test-status">
        <div class="status-item">
          <span class="status-label">Status:</span>
          <span class="status-value" :class="testStatusClass">{{ testStatusText }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Progress:</span>
          <span class="status-value">{{ testProgress }}%</span>
        </div>
        <div class="status-item">
          <span class="status-label">Active Users:</span>
          <span class="status-value">{{ activeUsers }}/{{ concurrentUsers }}</span>
        </div>
        <div class="status-item">
          <span class="status-label">Elapsed Time:</span>
          <span class="status-value">{{ elapsedTime }}</span>
        </div>
      </div>
      
      <!-- Performance Metrics -->
      <div class="performance-metrics">
        <h4 class="metrics-title">Real-time Metrics</h4>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Response Time</div>
            <div class="metric-value">{{ formatTime(averageResponseTime) }}</div>
            <div class="metric-trend" :class="responseTimeTrend">
              {{ responseTimeTrend === 'improving' ? '↓' : '↑' }}
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">Throughput</div>
            <div class="metric-value">{{ requestsPerSecond }}/s</div>
            <div class="metric-trend" :class="throughputTrend">
              {{ throughputTrend === 'improving' ? '↑' : '↓' }}
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">Error Rate</div>
            <div class="metric-value">{{ errorRate }}%</div>
            <div class="metric-trend" :class="errorRateTrend">
              {{ errorRateTrend === 'improving' ? '↓' : '↑' }}
            </div>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">CPU Usage</div>
            <div class="metric-value">{{ cpuUsage }}%</div>
            <div class="metric-trend" :class="cpuUsageTrend">
              {{ cpuUsageTrend === 'improving' ? '↓' : '↑' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Test Actions -->
      <div class="test-actions">
        <button 
          @click="startLoadTest"
          class="action-btn start"
          :disabled="isTesting"
        >
          <span v-if="isTesting">Testing...</span>
          <span v-else>Start Test</span>
        </button>
        <button 
          @click="stopLoadTest"
          class="action-btn stop"
          :disabled="!isTesting"
        >
          Stop Test
        </button>
        <button 
          @click="showTestHistory = !showTestHistory"
          class="action-btn history"
        >
          {{ showTestHistory ? 'Hide' : 'Show' }} History
        </button>
      </div>
      
      <!-- Test History -->
      <div 
        v-if="showTestHistory"
        class="test-history"
      >
        <h4 class="history-title">Test History</h4>
        <div class="history-list">
          <div 
            v-for="test in testHistory"
            :key="test.id"
            class="history-item"
            :class="test.status"
          >
            <div class="history-header">
              <span class="test-id">#{{ test.id }}</span>
              <span class="test-status">{{ test.status }}</span>
              <span class="test-type">{{ test.type }}</span>
            </div>
            <div class="history-details">
              <span class="test-users">{{ test.concurrentUsers }} users</span>
              <span class="test-duration">{{ test.duration }}m</span>
              <span class="test-date">{{ formatDate(test.timestamp) }}</span>
            </div>
            <div class="history-metrics">
              <span class="metric">RT: {{ formatTime(test.avgResponseTime) }}</span>
              <span class="metric">TP: {{ test.throughput }}/s</span>
              <span class="metric">ER: {{ test.errorRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Load Test Toggle Button -->
    <button 
      v-if="!showDashboard"
      @click="toggleDashboard"
      class="load-toggle-btn"
      :class="testStatusClass"
      :title="`Load Test: ${testStatusText}`"
    >
      <ServerIcon class="w-5 h-5" />
    </button>
    
    <!-- Main Content -->
    <div class="load-content">
      <slot 
        :test-status="testStatus"
        :is-testing="isTesting"
        :test-type="testType"
        :concurrent-users="concurrentUsers"
        :test-duration="testDuration"
        :start-load-test="startLoadTest"
        :stop-load-test="stopLoadTest"
        :get-test-report="getTestReport"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  ServerIcon,
  XMarkIcon,
  PlayIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  // Test configuration
  defaultTestType: {
    type: String,
    default: 'stress'
  },
  defaultConcurrentUsers: {
    type: Number,
    default: 10
  },
  defaultTestDuration: {
    type: Number,
    default: 5
  },
  defaultRampUpTime: {
    type: Number,
    default: 30
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
  
  // Test configuration
  enableAutoTesting: {
    type: Boolean,
    default: false
  },
  testInterval: {
    type: Number,
    default: 600000 // 10 minutes
  }
})

// Emits
const emit = defineEmits([
  'test-started',
  'test-completed',
  'test-failed',
  'test-stopped',
  'test-type-changed',
  'concurrent-users-changed',
  'test-duration-changed',
  'ramp-up-time-changed'
])

// Reactive state
const showDashboard = ref(props.showDashboard)
const showTestHistory = ref(false)
const isTesting = ref(false)
const testType = ref(props.defaultTestType)
const concurrentUsers = ref(props.defaultConcurrentUsers)
const testDuration = ref(props.defaultTestDuration)
const rampUpTime = ref(props.defaultRampUpTime)

// Test state
const testStatus = ref('idle')
const testProgress = ref(0)
const activeUsers = ref(0)
const elapsedTime = ref('0:00')
const testStartTime = ref(null)

// Performance metrics
const averageResponseTime = ref(0)
const requestsPerSecond = ref(0)
const errorRate = ref(0)
const cpuUsage = ref(0)

// Metric trends
const responseTimeTrend = ref('stable')
const throughputTrend = ref('stable')
const errorRateTrend = ref('stable')
const cpuUsageTrend = ref('stable')

// Test history
const testHistory = ref([])

// Test interval
let testInterval = null
let progressInterval = null

// Computed properties
const testStatusClass = computed(() => {
  return `status-${testStatus.value}`
})

const testStatusText = computed(() => {
  const status = testStatus.value
  const statusMap = {
    idle: 'Ready',
    starting: 'Starting...',
    running: 'Running...',
    completed: 'Completed',
    failed: 'Failed',
    stopped: 'Stopped'
  }
  return statusMap[status] || status
})

// Methods
const startLoadTest = async () => {
  if (isTesting.value) return
  
  isTesting.value = true
  testStatus.value = 'starting'
  testProgress.value = 0
  activeUsers.value = 0
  testStartTime.value = Date.now()
  
  emit('test-started', {
    type: testType.value,
    concurrentUsers: concurrentUsers.value,
    duration: testDuration.value,
    rampUpTime: rampUpTime.value,
    timestamp: Date.now()
  })
  
  try {
    // Simulate test startup
    await simulateTestStartup()
    
    // Start test execution
    testStatus.value = 'running'
    startProgressTracking()
    
    // Simulate test execution
    await simulateTestExecution()
    
    // Test completed
    testStatus.value = 'completed'
    testProgress.value = 100
    activeUsers.value = 0
    
    // Add to history
    addTestToHistory({
      type: testType.value,
      concurrentUsers: concurrentUsers.value,
      duration: testDuration.value,
      status: 'completed',
      avgResponseTime: averageResponseTime.value,
      throughput: requestsPerSecond.value,
      errorRate: errorRate.value
    })
    
    emit('test-completed', {
      type: testType.value,
      concurrentUsers: concurrentUsers.value,
      duration: testDuration.value,
      metrics: {
        responseTime: averageResponseTime.value,
        throughput: requestsPerSecond.value,
        errorRate: errorRate.value,
        cpuUsage: cpuUsage.value
      }
    })
    
  } catch (error) {
    // Test failed
    testStatus.value = 'failed'
    activeUsers.value = 0
    
    // Add to history
    addTestToHistory({
      type: testType.value,
      concurrentUsers: concurrentUsers.value,
      duration: testDuration.value,
      status: 'failed',
      error: error.message
    })
    
    emit('test-failed', {
      type: testType.value,
      concurrentUsers: concurrentUsers.value,
      duration: testDuration.value,
      error: error.message
    })
    
  } finally {
    isTesting.value = false
    stopProgressTracking()
  }
}

const stopLoadTest = () => {
  if (!isTesting.value) return
  
  testStatus.value = 'stopped'
  isTesting.value = false
  activeUsers.value = 0
  stopProgressTracking()
  
  // Add to history
  addTestToHistory({
    type: testType.value,
    concurrentUsers: concurrentUsers.value,
    duration: testDuration.value,
    status: 'stopped',
    avgResponseTime: averageResponseTime.value,
    throughput: requestsPerSecond.value,
    errorRate: errorRate.value
  })
  
  emit('test-stopped', {
    type: testType.value,
    concurrentUsers: concurrentUsers.value,
    duration: testDuration.value,
    metrics: {
      responseTime: averageResponseTime.value,
      throughput: requestsPerSecond.value,
      errorRate: errorRate.value,
      cpuUsage: cpuUsage.value
    }
  })
}

const simulateTestStartup = async () => {
  // Simulate startup delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Initialize metrics
  averageResponseTime.value = Math.random() * 500 + 100 // 100-600ms
  requestsPerSecond.value = Math.random() * 50 + 10 // 10-60 req/s
  errorRate.value = Math.random() * 5 // 0-5%
  cpuUsage.value = Math.random() * 30 + 20 // 20-50%
}

const simulateTestExecution = async () => {
  const totalDuration = testDuration.value * 60 * 1000 // Convert to milliseconds
  const startTime = Date.now()
  
  return new Promise((resolve, reject) => {
    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / totalDuration) * 100, 100)
      
      testProgress.value = Math.round(progress)
      
      // Simulate metric changes
      updateMetrics()
      
      // Simulate active users ramp-up
      if (progress < 20) {
        activeUsers.value = Math.round((progress / 20) * concurrentUsers.value)
      } else if (progress > 80) {
        activeUsers.value = Math.round(((100 - progress) / 20) * concurrentUsers.value)
      } else {
        activeUsers.value = concurrentUsers.value
      }
      
      // Check for completion
      if (progress >= 100) {
        clearInterval(updateInterval)
        resolve()
      }
      
      // Random failure chance (2%)
      if (Math.random() < 0.02) {
        clearInterval(updateInterval)
        reject(new Error('Test failed due to system overload'))
      }
    }, 1000)
  })
}

const updateMetrics = () => {
  // Simulate realistic metric changes
  const change = (Math.random() - 0.5) * 0.2 // ±10% change
  
  // Response time
  const newResponseTime = averageResponseTime.value * (1 + change)
  averageResponseTime.value = Math.max(50, Math.min(2000, newResponseTime))
  
  // Throughput
  const newThroughput = requestsPerSecond.value * (1 + change)
  requestsPerSecond.value = Math.max(5, Math.min(100, newThroughput))
  
  // Error rate
  const newErrorRate = errorRate.value * (1 + change)
  errorRate.value = Math.max(0, Math.min(10, newErrorRate))
  
  // CPU usage
  const newCpuUsage = cpuUsage.value * (1 + change)
  cpuUsage.value = Math.max(10, Math.min(90, newCpuUsage))
  
  // Update trends
  updateTrends()
}

const updateTrends = () => {
  // Simple trend calculation based on current vs previous values
  // In a real implementation, this would use historical data
  
  responseTimeTrend.value = Math.random() > 0.5 ? 'improving' : 'degrading'
  throughputTrend.value = Math.random() > 0.5 ? 'improving' : 'degrading'
  errorRateTrend.value = Math.random() > 0.5 ? 'improving' : 'degrading'
  cpuUsageTrend.value = Math.random() > 0.5 ? 'improving' : 'degrading'
}

const startProgressTracking = () => {
  progressInterval = setInterval(() => {
    if (testStartTime.value) {
      const elapsed = Date.now() - testStartTime.value
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      elapsedTime.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  }, 1000)
}

const stopProgressTracking = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

const addTestToHistory = (test) => {
  const testRecord = {
    id: Date.now(),
    type: test.type,
    concurrentUsers: test.concurrentUsers,
    duration: test.duration,
    status: test.status,
    timestamp: Date.now(),
    avgResponseTime: test.avgResponseTime || 0,
    throughput: test.throughput || 0,
    errorRate: test.errorRate || 0,
    error: test.error
  }
  
  testHistory.value.unshift(testRecord)
  
  // Keep only last 10 tests
  if (testHistory.value.length > 10) {
    testHistory.value = testHistory.value.slice(0, 10)
  }
}

const updateTestType = () => {
  emit('test-type-changed', {
    type: testType.value,
    timestamp: Date.now()
  })
}

const updateConcurrentUsers = () => {
  emit('concurrent-users-changed', {
    users: concurrentUsers.value,
    timestamp: Date.now()
  })
}

const updateTestDuration = () => {
  emit('test-duration-changed', {
    duration: testDuration.value,
    timestamp: Date.now()
  })
}

const updateRampUpTime = () => {
  emit('ramp-up-time-changed', {
    rampUpTime: rampUpTime.value,
    timestamp: Date.now()
  })
}

const toggleDashboard = () => {
  showDashboard.value = !showDashboard.value
}

const getTestReport = () => {
  return {
    timestamp: Date.now(),
    status: testStatus.value,
    type: testType.value,
    concurrentUsers: concurrentUsers.value,
    duration: testDuration.value,
    rampUpTime: rampUpTime.value,
    metrics: {
      responseTime: averageResponseTime.value,
      throughput: requestsPerSecond.value,
      errorRate: errorRate.value,
      cpuUsage: cpuUsage.value
    },
    testHistory: testHistory.value
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

// Auto-testing functionality
const startAutoTesting = () => {
  if (!props.enableAutoTesting) return
  
  testInterval = setInterval(() => {
    // Auto-test logic
    if (testStatus.value === 'idle') {
      startLoadTest()
    }
  }, props.testInterval)
}

const stopAutoTesting = () => {
  if (testInterval) {
    clearInterval(testInterval)
    testInterval = null
  }
}

// Lifecycle
onMounted(() => {
  startAutoTesting()
})

onUnmounted(() => {
  stopAutoTesting()
  stopProgressTracking()
})

// Expose methods
defineExpose({
  testStatus: computed(() => testStatus.value),
  isTesting: computed(() => isTesting.value),
  testType: computed(() => testType.value),
  concurrentUsers: computed(() => concurrentUsers.value),
  testDuration: computed(() => testDuration.value),
  startLoadTest,
  stopLoadTest,
  getTestReport
})
</script>

<style scoped>
.load-tester {
  position: relative;
}

.load-dashboard {
  position: fixed;
  top: 4rem;
  right: 1rem;
  width: 420px;
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

.action-btn.start {
  background: #10b981;
  color: white;
}

.action-btn.start:hover {
  background: #059669;
}

.action-btn.start:disabled {
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

.test-config {
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

.range-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-slider {
  flex: 1;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: #d1d5db;
  outline: none;
  -webkit-appearance: none;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.range-value {
  min-width: 3rem;
  text-align: right;
  font-weight: 600;
  color: #111827;
  font-size: 0.75rem;
}

.test-status {
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

.status-value.status-running {
  color: #2563eb;
}

.status-value.status-completed {
  color: #059669;
}

.status-value.status-failed {
  color: #dc2626;
}

.status-value.status-stopped {
  color: #f59e0b;
}

.performance-metrics {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.metrics-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.metric-card {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  text-align: center;
  position: relative;
}

.metric-label {
  font-size: 0.625rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.metric-trend {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.metric-trend.improving {
  color: #059669;
}

.metric-trend.degrading {
  color: #dc2626;
}

.metric-trend.stable {
  color: #6b7280;
}

.test-actions {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn.start,
.action-btn.stop,
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

.action-btn.stop {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.action-btn.stop:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.action-btn.stop:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.history:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.test-history {
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

.history-item.completed {
  border-left-color: #10b981;
}

.history-item.failed {
  border-left-color: #ef4444;
}

.history-item.stopped {
  border-left-color: #f59e0b;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.test-id {
  font-weight: 600;
  color: #111827;
  font-size: 0.75rem;
}

.test-status {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  font-weight: 600;
}

.test-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.test-status.failed {
  background: #fee2e2;
  color: #991b1b;
}

.test-status.stopped {
  background: #fef3c7;
  color: #92400e;
}

.test-type {
  font-size: 0.625rem;
  color: #6b7280;
  font-weight: 500;
}

.history-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.625rem;
  color: #6b7280;
}

.test-users,
.test-duration,
.test-date {
  font-size: 0.625rem;
}

.history-metrics {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  color: #6b7280;
}

.metric {
  font-size: 0.625rem;
}

.load-toggle-btn {
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

.load-toggle-btn:hover {
  transform: scale(1.1);
}

.load-toggle-btn.status-running {
  background: #2563eb;
}

.load-toggle-btn.status-completed {
  background: #10b981;
}

.load-toggle-btn.status-failed {
  background: #ef4444;
}

.load-toggle-btn.status-stopped {
  background: #f59e0b;
}

.load-toggle-btn.status-idle {
  background: #6b7280;
}

.load-content {
  width: 100%;
}

/* Responsive design */
@media (max-width: 640px) {
  .load-dashboard {
    width: calc(100vw - 2rem);
    right: 1rem;
    left: 1rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
