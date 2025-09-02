<template>
  <AdminLayout>
    <div class="space-y-6 w-full max-w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p class="text-sm sm:text-base text-gray-600 mt-2">Comprehensive insights and performance metrics</p>
        </div>
        <div class="flex items-center space-x-3">
          <button 
            @click="refreshAllData"
            :disabled="isRefreshing"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            <span v-if="isRefreshing">Refreshing...</span>
            <span v-else>Refresh All</span>
          </button>
          <button 
            @click="showSettingsModal = true"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
          >
            Settings
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="space-y-8">
        <!-- Quick Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            v-for="stat in quickStats" 
            :key="stat.label"
            class="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="p-3 rounded-full" :class="stat.bgColor">
                  <component :is="stat.icon" class="w-6 h-6 text-white" />
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">{{ stat.label }}</p>
                <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
              </div>
            </div>
            <div class="mt-4 flex items-center text-sm">
              <span 
                :class="stat.trend > 0 ? 'text-green-600' : 'text-red-600'"
                class="font-medium"
              >
                {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
              </span>
              <span class="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
        </div>

        <!-- Analytics Components -->
        <div class="space-y-8">
          <!-- Performance Charts -->
          <PerformanceCharts 
            :quiz-data="quizData"
            :user-data="userData"
            @data-updated="handleDataUpdated"
          />

          <!-- User Engagement -->
          <UserEngagement 
            :user-data="userData"
            :quiz-data="quizData"
            @data-exported="handleDataExported"
          />

          <!-- Question Analytics -->
          <QuestionAnalytics 
            :questions="questions"
            :quiz-results="quizResults"
            @question-preview="handleQuestionPreview"
            @question-edit="handleQuestionEdit"
            @report-generated="handleReportGenerated"
          />

          <!-- Export System -->
          <ExportSystem 
            :analytics-data="analyticsData"
            @export-created="handleExportCreated"
            @schedule-created="handleScheduleCreated"
            @export-downloaded="handleExportDownloaded"
          />
        </div>
      </div>

      <!-- Question Preview Modal -->
      <div v-if="showQuestionPreview" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Question Preview</h3>
              <button 
                @click="showQuestionPreview = false"
                class="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
            
            <div v-if="previewingQuestion" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                <div class="p-3 bg-gray-50 rounded-md border">
                  <p class="text-gray-900">{{ previewingQuestion.text }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <span class="inline-flex px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                    {{ previewingQuestion.category }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <span 
                    :class="getDifficultyClass(previewingQuestion.difficulty)"
                    class="inline-flex px-2 py-1 text-sm rounded-full"
                  >
                    {{ previewingQuestion.difficulty }}
                  </span>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                <span class="inline-flex px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
                  {{ previewingQuestion.type }}
                </span>
              </div>
              
              <div v-if="previewingQuestion.type === 'Multiple Choice'">
                <label class="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                <div class="space-y-2">
                  <div 
                    v-for="(option, index) in previewingQuestion.options" 
                    :key="index"
                    class="p-2 bg-gray-50 rounded border"
                  >
                    <span class="text-sm text-gray-600">{{ String.fromCharCode(65 + index) }}.</span>
                    <span class="ml-2 text-gray-900">{{ option }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Modal -->
      <div v-if="showSettingsModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Analytics Settings</h3>
              <button 
                @click="showSettingsModal = false"
                class="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Default Time Range</label>
                <select 
                  v-model="settings.defaultTimeRange"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Auto-refresh Interval (seconds)</label>
                <select 
                  v-model="settings.autoRefreshInterval"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Disabled</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Chart Theme</label>
                <select 
                  v-model="settings.chartTheme"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (system preference)</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Export Defaults</label>
                <div class="space-y-2">
                  <label class="flex items-center">
                    <input 
                      v-model="settings.exportDefaults.includeMetadata"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">Include metadata by default</span>
                  </label>
                  <label class="flex items-center">
                    <input 
                      v-model="settings.exportDefaults.compressFiles"
                      type="checkbox"
                      class="mr-2"
                    />
                    <span class="text-sm">Compress files by default</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
              <button 
                @click="showSettingsModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                @click="saveSettings"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import PerformanceCharts from '../../components/admin/Analytics/PerformanceCharts.vue'
import UserEngagement from '../../components/admin/Analytics/UserEngagement.vue'
import QuestionAnalytics from '../../components/admin/Analytics/QuestionAnalytics.vue'
import ExportSystem from '../../components/admin/Analytics/ExportSystem.vue'

// Reactive state
const isRefreshing = ref(false)
const showQuestionPreview = ref(false)
const showSettingsModal = ref(false)
const previewingQuestion = ref(null)

// Settings
const settings = reactive({
  defaultTimeRange: '30d',
  autoRefreshInterval: 0,
  chartTheme: 'light',
  exportDefaults: {
    includeMetadata: true,
    compressFiles: false
  }
})

// Sample data - replace with actual API calls
const quickStats = reactive([
  {
    label: 'Total Users',
    value: '2,847',
    trend: 12.5,
    bgColor: 'bg-blue-500',
    icon: 'UsersIcon'
  },
  {
    label: 'Active Quizzes',
    value: '156',
    trend: 8.2,
    bgColor: 'bg-green-500',
    icon: 'AcademicCapIcon'
  },
  {
    label: 'Questions Answered',
    value: '45,892',
    trend: 15.7,
    bgColor: 'bg-purple-500',
    icon: 'QuestionMarkCircleIcon'
  },
  {
    label: 'Success Rate',
    value: '78.3%',
    trend: 3.2,
    bgColor: 'bg-yellow-500',
    icon: 'ChartBarIcon'
  }
])

const quizData = reactive([])
const userData = reactive([])
const questions = reactive([])
const quizResults = reactive([])
const analyticsData = reactive({})

// Auto-refresh timer
let autoRefreshTimer = null

// Methods
const refreshAllData = async () => {
  isRefreshing.value = true
  try {
    // Simulate API calls to refresh all data
    await Promise.all([
      loadQuizData(),
      loadUserData(),
      loadQuestions(),
      loadQuizResults(),
      loadAnalyticsData()
    ])
    
    console.log('All data refreshed successfully')
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    isRefreshing.value = false
  }
}

const loadQuizData = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  // Replace with actual API call
  console.log('Loading quiz data...')
}

const loadUserData = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  // Replace with actual API call
  console.log('Loading user data...')
}

const loadQuestions = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  // Replace with actual API call
  console.log('Loading questions...')
}

const loadQuizResults = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  // Replace with actual API call
  console.log('Loading quiz results...')
}

const loadAnalyticsData = async () => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500))
  // Replace with actual API call
  console.log('Loading analytics data...')
}

const handleDataUpdated = (data) => {
  console.log('Data updated:', data)
}

const handleDataExported = (data) => {
  console.log('Data exported:', data)
}

const handleQuestionPreview = (question) => {
  previewingQuestion.value = question
  showQuestionPreview.value = true
}

const handleQuestionEdit = (question) => {
  console.log('Edit question:', question)
  // Navigate to question editor or open edit modal
}

const handleReportGenerated = (report) => {
  console.log('Report generated:', report)
}

const handleExportCreated = (exportItem) => {
  console.log('Export created:', exportItem)
}

const handleScheduleCreated = (schedule) => {
  console.log('Schedule created:', schedule)
}

const handleExportDownloaded = (exportItem) => {
  console.log('Export downloaded:', exportItem)
}

const saveSettings = () => {
  // Save settings to localStorage or API
  localStorage.setItem('analytics-settings', JSON.stringify(settings))
  showSettingsModal.value = false
  console.log('Settings saved:', settings)
}

const loadSettings = () => {
  // Load settings from localStorage or API
  const savedSettings = localStorage.getItem('analytics-settings')
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings))
  }
}

const getDifficultyClass = (difficulty) => {
  const classes = {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Hard': 'bg-red-100 text-red-800'
  }
  return classes[difficulty] || 'bg-gray-100 text-gray-800'
}

const setupAutoRefresh = () => {
  if (settings.autoRefreshInterval > 0) {
    autoRefreshTimer = setInterval(() => {
      refreshAllData()
    }, settings.autoRefreshInterval * 1000)
  }
}

const clearAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

// Lifecycle
onMounted(async () => {
  loadSettings()
  await refreshAllData()
  setupAutoRefresh()
})

onUnmounted(() => {
  clearAutoRefresh()
})
</script>


