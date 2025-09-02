<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Performance Analytics</h3>
        <p class="text-sm text-gray-600">Interactive charts and performance metrics</p>
      </div>
      <div class="flex items-center space-x-3">
        <select 
          v-model="selectedTimeRange" 
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
        <button 
          @click="refreshData"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div 
        v-for="metric in keyMetrics" 
        :key="metric.label"
        class="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-600">{{ metric.label }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ metric.value }}</p>
          </div>
          <div class="p-2 bg-blue-100 rounded-full">
            <component :is="metric.icon" class="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div class="mt-2 flex items-center text-sm">
          <span 
            :class="metric.trend > 0 ? 'text-green-600' : 'text-red-600'"
            class="font-medium"
          >
            {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
          </span>
          <span class="text-gray-500 ml-1">vs last period</span>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quiz Performance Over Time -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-semibold text-gray-900 mb-4">Quiz Performance Over Time</h4>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="performanceChart" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- Question Difficulty Distribution -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-semibold text-gray-900 mb-4">Question Difficulty Distribution</h4>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="difficultyChart" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- Category Performance -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-semibold text-gray-900 mb-4">Category Performance</h4>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="categoryChart" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- User Engagement Trends -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-semibold text-gray-900 mb-4">User Engagement Trends</h4>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="engagementChart" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>

    <!-- Detailed Analytics Table -->
    <div class="mt-8">
      <h4 class="text-md font-semibold text-gray-900 mb-4">Detailed Performance Data</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="row in detailedData" :key="row.metric">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ row.metric }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ row.current }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ row.previous }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span 
                  :class="row.change > 0 ? 'text-green-600' : 'text-red-600'"
                  class="font-medium"
                >
                  {{ row.change > 0 ? '+' : '' }}{{ row.change }}%
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <component 
                    :is="row.trend === 'up' ? 'ArrowUpIcon' : 'ArrowDownIcon'"
                    :class="row.trend === 'up' ? 'text-green-500' : 'text-red-500'"
                    class="w-4 h-4 mr-1"
                  />
                  <span class="text-sm text-gray-500">{{ row.trend === 'up' ? 'Improving' : 'Declining' }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { 
    ArrowUpIcon,
  ArrowDownIcon,
  UsersIcon,
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

// Register Chart.js components
Chart.register(...registerables)

// Props
const props = defineProps({
  quizData: {
    type: Array,
    default: () => []
  },
  userData: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['data-updated'])

// Reactive state
const selectedTimeRange = ref('30d')
const isLoading = ref(false)

// Chart references
const performanceChart = ref(null)
const difficultyChart = ref(null)
const categoryChart = ref(null)
const engagementChart = ref(null)

// Chart instances
let charts = {
  performance: null,
  difficulty: null,
  category: null,
  engagement: null
}

// Sample data - replace with actual API calls
const keyMetrics = reactive([
  {
    label: 'Total Users',
    value: '1,234',
    trend: 12.5,
    icon: UsersIcon
  },
  {
    label: 'Active Quizzes',
    value: '89',
    trend: 8.2,
    icon: AcademicCapIcon
  },
  {
    label: 'Avg. Completion Time',
    value: '15m 32s',
    trend: -5.1,
    icon: ClockIcon
  },
  {
    label: 'Success Rate',
    value: '78.5%',
    trend: 3.2,
    icon: ChartBarIcon
  }
])

const detailedData = reactive([
  {
    metric: 'Quiz Completion Rate',
    current: '78.5%',
    previous: '75.2%',
    change: 3.3,
    trend: 'up'
  },
  {
    metric: 'Average Score',
    current: '72.8',
    previous: '70.1',
    change: 2.7,
    trend: 'up'
  },
  {
    metric: 'Question Difficulty Balance',
    current: 'Good',
    previous: 'Fair',
    change: 15.0,
    trend: 'up'
  },
  {
    metric: 'User Retention',
    current: '65.2%',
    previous: '68.1%',
    change: -2.9,
    trend: 'down'
  }
])

// Methods
const refreshData = async () => {
  isLoading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update metrics with new data
    updateMetrics()
    
    // Refresh charts
    await nextTick()
    refreshCharts()
    
    emit('data-updated')
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    isLoading.value = false
  }
}

const updateMetrics = () => {
  // Update metrics based on selected time range
  // This would typically involve API calls to get real data
  console.log('Updating metrics for time range:', selectedTimeRange.value)
}

const createPerformanceChart = () => {
  const ctx = performanceChart.value?.getContext('2d')
  if (!ctx) return

  charts.performance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Average Score',
          data: [75, 78, 82, 79, 85, 88, 86],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Completion Rate',
          data: [65, 68, 72, 70, 75, 78, 76],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  })
}

const createDifficultyChart = () => {
  const ctx = difficultyChart.value?.getContext('2d')
  if (!ctx) return

  charts.difficulty = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Easy', 'Medium', 'Hard'],
      datasets: [{
        data: [30, 45, 25],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  })
}

const createCategoryChart = () => {
  const ctx = categoryChart.value?.getContext('2d')
  if (!ctx) return

  charts.category = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Math', 'Science', 'History', 'Literature', 'Geography'],
      datasets: [{
        label: 'Success Rate',
        data: [85, 72, 68, 75, 80],
        backgroundColor: 'rgba(99, 102, 241, 0.8)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  })
}

const createEngagementChart = () => {
  const ctx = engagementChart.value?.getContext('2d')
  if (!ctx) return

  charts.engagement = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Active Users',
        data: [120, 135, 142, 158],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

const refreshCharts = () => {
  // Destroy existing charts
  Object.values(charts).forEach(chart => {
    if (chart) {
      chart.destroy()
    }
  })

  // Recreate charts
  createPerformanceChart()
  createDifficultyChart()
  createCategoryChart()
  createEngagementChart()
}

// Watchers
watch(selectedTimeRange, () => {
  refreshData()
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  createPerformanceChart()
  createDifficultyChart()
  createCategoryChart()
  createEngagementChart()
})
</script>

<style scoped>
/* Custom styles for charts */
canvas {
  max-height: 100%;
  max-width: 100%;
}
</style>
