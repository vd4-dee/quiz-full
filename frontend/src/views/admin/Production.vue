<template>
  <AdminLayout>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Production Dashboard</h1>
          <p class="text-gray-600">Build system, load testing, and predictive analytics</p>
        </div>
        <div class="flex items-center space-x-4">
          <button
            @click="refreshAll"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            :disabled="isRefreshing"
          >
            <ArrowPathIcon v-if="!isRefreshing" class="w-4 h-4 mr-2" />
            <div v-else class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Refresh All
          </button>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CogIcon class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Build Status</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ buildStatusText }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ServerIcon class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Test Status</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ testStatusText }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <CpuChipIcon class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Analysis Status</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ analysisStatusText }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <ChartBarIcon class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Overall Health</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ overallHealth }}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Production Components -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Build System -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Build System</h3>
            <p class="text-sm text-gray-600">Automated build processes and environment management</p>
          </div>
          <div class="p-6">
            <BuildSystem
              :show-dashboard="false"
              @build-started="handleBuildStarted"
              @build-completed="handleBuildCompleted"
              @build-failed="handleBuildFailed"
            />
            <div class="mt-4 space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Environment:</span>
                <span class="font-medium">{{ buildEnvironment }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Build Mode:</span>
                <span class="font-medium">{{ buildMode }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Optimization:</span>
                <span class="font-medium">{{ optimizationLevel }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Load Testing -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Load Testing</h3>
            <p class="text-sm text-gray-600">Performance testing and capacity planning</p>
          </div>
          <div class="p-6">
            <LoadTester
              :show-dashboard="false"
              @test-started="handleTestStarted"
              @test-completed="handleTestCompleted"
              @test-failed="handleTestFailed"
            />
            <div class="mt-4 space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Test Type:</span>
                <span class="font-medium">{{ testType }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Concurrent Users:</span>
                <span class="font-medium">{{ concurrentUsers }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Test Duration:</span>
                <span class="font-medium">{{ testDuration }}m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Predictive Analytics -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Predictive Analytics</h3>
          <p class="text-sm text-gray-600">Machine learning insights and user behavior analysis</p>
        </div>
        <div class="p-6">
          <PredictiveAnalytics
            :show-dashboard="false"
            @analysis-started="handleAnalysisStarted"
            @analysis-completed="handleAnalysisCompleted"
          />
          <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-indigo-600">{{ mlModels.length }}</div>
              <div class="text-sm text-gray-500">ML Models</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ currentPredictions.length }}</div>
              <div class="text-sm text-gray-500">Active Predictions</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ accuracy }}%</div>
              <div class="text-sm text-gray-500">Model Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Production Actions -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Production Actions</h3>
          <p class="text-sm text-gray-600">Quick actions for production management</p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              @click="startProductionBuild"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              :disabled="isBuilding"
            >
              <CogIcon class="w-4 h-4 mr-2" />
              {{ isBuilding ? 'Building...' : 'Start Production Build' }}
            </button>
            
            <button
              @click="startLoadTest"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              :disabled="isTesting"
            >
              <ServerIcon class="w-4 h-4 mr-2" />
              {{ isTesting ? 'Testing...' : 'Start Load Test' }}
            </button>
            
            <button
              @click="runAnalytics"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              :disabled="isAnalyzing"
            >
              <CpuChipIcon class="w-4 h-4 mr-2" />
              {{ isAnalyzing ? 'Analyzing...' : 'Run Analytics' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Production Reports -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Production Reports</h3>
          <p class="text-sm text-gray-600">Generate and export production insights</p>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              @click="generateProductionReport"
              class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentTextIcon class="w-4 h-4 mr-2" />
              Generate Production Report
            </button>
            
            <button
              @click="exportAllData"
              class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowDownTrayIcon class="w-4 h-4 mr-2" />
              Export All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import BuildSystem from '../../components/production/BuildSystem.vue'
import LoadTester from '../../components/production/LoadTester.vue'
import PredictiveAnalytics from '../../components/production/PredictiveAnalytics.vue'
import {
  CogIcon,
  ServerIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

// Component refs
const buildSystemRef = ref(null)
const loadTesterRef = ref(null)
const predictiveAnalyticsRef = ref(null)

// State
const isRefreshing = ref(false)
const isBuilding = ref(false)
const isTesting = ref(false)
const isAnalyzing = ref(false)

// Build system state
const buildStatus = ref('idle')
const buildEnvironment = ref('development')
const buildMode = ref('development')
const optimizationLevel = ref('medium')

// Load testing state
const testStatus = ref('idle')
const testType = ref('stress')
const concurrentUsers = ref(10)
const testDuration = ref(5)

// Analytics state
const analysisStatus = ref('idle')
const mlModels = ref([])
const currentPredictions = ref([])
const accuracy = ref(0)

// Computed properties
const buildStatusText = computed(() => {
  const statusMap = {
    idle: 'Ready',
    building: 'Building...',
    success: 'Success',
    failed: 'Failed',
    cancelled: 'Cancelled'
  }
  return statusMap[buildStatus.value] || buildStatus.value
})

const testStatusText = computed(() => {
  const statusMap = {
    idle: 'Ready',
    starting: 'Starting...',
    running: 'Running...',
    completed: 'Completed',
    failed: 'Failed',
    stopped: 'Stopped'
  }
  return statusMap[testStatus.value] || testStatus.value
})

const analysisStatusText = computed(() => {
  const statusMap = {
    idle: 'Ready',
    analyzing: 'Analyzing...',
    completed: 'Completed',
    failed: 'Failed'
  }
  return statusMap[analysisStatus.value] || analysisStatus.value
})

const overallHealth = computed(() => {
  let health = 100
  
  // Deduct points for various issues
  if (buildStatus.value === 'failed') health -= 20
  if (testStatus.value === 'failed') health -= 15
  if (analysisStatus.value === 'failed') health -= 10
  
  return Math.max(0, health)
})

// Event handlers
const handleBuildStarted = (data) => {
  buildStatus.value = 'building'
  isBuilding.value = true
  console.log('Build started:', data)
}

const handleBuildCompleted = (data) => {
  buildStatus.value = 'success'
  isBuilding.value = false
  console.log('Build completed:', data)
}

const handleBuildFailed = (data) => {
  buildStatus.value = 'failed'
  isBuilding.value = false
  console.log('Build failed:', data)
}

const handleTestStarted = (data) => {
  testStatus.value = 'running'
  isTesting.value = true
  console.log('Test started:', data)
}

const handleTestCompleted = (data) => {
  testStatus.value = 'completed'
  isTesting.value = false
  console.log('Test completed:', data)
}

const handleTestFailed = (data) => {
  testStatus.value = 'failed'
  isTesting.value = false
  console.log('Test failed:', data)
}

const handleAnalysisStarted = () => {
  analysisStatus.value = 'analyzing'
  isAnalyzing.value = true
  console.log('Analysis started')
}

const handleAnalysisCompleted = () => {
  analysisStatus.value = 'completed'
  isAnalyzing.value = false
  console.log('Analysis completed')
}

// Actions
const refreshAll = async () => {
  isRefreshing.value = true
  
  try {
    // Refresh all components
    if (buildSystemRef.value) {
      // Trigger refresh on build system
    }
    
    if (loadTesterRef.value) {
      // Trigger refresh on load tester
    }
    
    if (predictiveAnalyticsRef.value) {
      // Trigger refresh on predictive analytics
    }
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  } finally {
    isRefreshing.value = false
  }
}

const startProductionBuild = async () => {
  if (isBuilding.value) return
  
  try {
    isBuilding.value = true
    buildStatus.value = 'building'
    
    // Simulate production build
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    buildStatus.value = 'success'
    console.log('Production build completed')
    
  } catch (error) {
    buildStatus.value = 'failed'
    console.error('Production build failed:', error)
  } finally {
    isBuilding.value = false
  }
}

const startLoadTest = async () => {
  if (isTesting.value) return
  
  try {
    isTesting.value = true
    testStatus.value = 'running'
    
    // Simulate load test
    await new Promise(resolve => setTimeout(resolve, 8000))
    
    testStatus.value = 'completed'
    console.log('Load test completed')
    
  } catch (error) {
    testStatus.value = 'failed'
    console.error('Load test failed:', error)
  } finally {
    isTesting.value = false
  }
}

const runAnalytics = async () => {
  if (isAnalyzing.value) return
  
  try {
    isAnalyzing.value = true
    analysisStatus.value = 'analyzing'
    
    // Simulate analytics run
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    analysisStatus.value = 'completed'
    console.log('Analytics completed')
    
  } catch (error) {
    analysisStatus.value = 'failed'
    console.error('Analytics failed:', error)
  } finally {
    isAnalyzing.value = false
  }
}

const generateProductionReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    buildStatus: buildStatus.value,
    testStatus: testStatus.value,
    analysisStatus: analysisStatus.value,
    overallHealth: overallHealth.value,
    environment: buildEnvironment.value,
    buildMode: buildMode.value,
    optimizationLevel: optimizationLevel.value,
    testType: testType.value,
    concurrentUsers: concurrentUsers.value,
    testDuration: testDuration.value
  }
  
  const dataStr = JSON.stringify(report, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `production-report-${Date.now()}.json`
  link.click()
  
  console.log('Production report generated:', report)
}

const exportAllData = () => {
  const allData = {
    timestamp: new Date().toISOString(),
    buildSystem: {
      status: buildStatus.value,
      environment: buildEnvironment.value,
      mode: buildMode.value,
      optimization: optimizationLevel.value
    },
    loadTesting: {
      status: testStatus.value,
      type: testType.value,
      concurrentUsers: concurrentUsers.value,
      duration: testDuration.value
    },
    analytics: {
      status: analysisStatus.value,
      mlModels: mlModels.value,
      predictions: currentPredictions.value,
      accuracy: accuracy.value
    }
  }
  
  const dataStr = JSON.stringify(allData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `production-data-${Date.now()}.json`
  link.click()
  
  console.log('All production data exported:', allData)
}

// Initialize data
onMounted(() => {
  // Initialize ML models
  mlModels.value = [
    { id: 'perf', name: 'Performance Predictor', accuracy: 85, status: 'ready' },
    { id: 'diff', name: 'Difficulty Adjuster', accuracy: 78, status: 'ready' },
    { id: 'eng', name: 'Engagement Forecaster', accuracy: 72, status: 'ready' }
  ]
  
  // Initialize predictions
  currentPredictions.value = [
    { id: '1', description: 'User likely to improve by 15%', confidence: 87 },
    { id: '2', description: 'High risk of performance decline', confidence: 73 }
  ]
  
  // Set initial accuracy
  accuracy.value = 78
})
</script>
