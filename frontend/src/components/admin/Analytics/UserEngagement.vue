<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">User Engagement Analytics</h3>
        <p class="text-sm text-gray-600">Track user activity, retention, and behavior patterns</p>
      </div>
      <div class="flex items-center space-x-3">
        <select 
          v-model="selectedMetric" 
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily Activity</option>
          <option value="weekly">Weekly Trends</option>
          <option value="monthly">Monthly Overview</option>
        </select>
        <button 
          @click="exportData"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
        >
          Export Data
        </button>
      </div>
    </div>

    <!-- Engagement Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div 
        v-for="metric in engagementMetrics" 
        :key="metric.label"
        class="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-600">{{ metric.label }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ metric.value }}</p>
          </div>
          <div class="p-2 bg-green-100 rounded-full">
            <component :is="metric.icon" class="w-5 h-5 text-green-600" />
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

    <!-- Activity Timeline Chart -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6">
      <h4 class="text-md font-semibold text-gray-900 mb-4">User Activity Timeline</h4>
      <div class="h-80 flex items-center justify-center">
        <canvas ref="activityChart" class="w-full h-full"></canvas>
      </div>
    </div>

    <!-- User Behavior Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Session Duration Distribution -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-semibold text-gray-900 mb-4">Session Duration Distribution</h4>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="sessionChart" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- Quiz Completion Patterns -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-semibold text-gray-900 mb-4">Quiz Completion Patterns</h4>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="completionChart" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>

    <!-- Top Active Users Table -->
    <div class="mb-6">
      <h4 class="text-md font-semibold text-gray-900 mb-4">Top Active Users</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes Taken</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in topUsers" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600">{{ user.initials }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.quizzesTaken }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.avgScore }}%</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.totalTime }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.lastActive }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusClass(user.status)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ user.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Engagement Insights -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 class="text-md font-semibold text-blue-900 mb-3">Engagement Insights</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="insight in engagementInsights" :key="insight.title" class="flex items-start">
          <div class="flex-shrink-0">
            <component :is="insight.icon" class="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-blue-900">{{ insight.title }}</p>
            <p class="text-sm text-blue-700">{{ insight.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'
import { 
  UsersIcon,
  ClockIcon,
  ChartBarIcon,
  FireIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Register Chart.js components
Chart.register(...registerables)

// Props
const props = defineProps({
  userData: {
    type: Array,
    default: () => []
  },
  quizData: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['data-exported'])

// Reactive state
const selectedMetric = ref('daily')

// Chart references
const activityChart = ref(null)
const sessionChart = ref(null)
const completionChart = ref(null)

// Chart instances
let charts = {
  activity: null,
  session: null,
  completion: null
}

// Sample data - replace with actual API calls
const engagementMetrics = reactive([
  {
    label: 'Active Users',
    value: '456',
    trend: 15.2,
    icon: UsersIcon
  },
  {
    label: 'Avg Session Time',
    value: '23m 45s',
    trend: 8.7,
    icon: ClockIcon
  },
  {
    label: 'Engagement Score',
    value: '78.3',
    trend: 12.1,
    icon: ChartBarIcon
  },
  {
    label: 'Retention Rate',
    value: '67.8%',
    trend: -2.3,
    icon: FireIcon
  }
])

const topUsers = reactive([
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    initials: 'JS',
    quizzesTaken: 24,
    avgScore: 87,
    totalTime: '8h 32m',
    lastActive: '2 hours ago',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    initials: 'SJ',
    quizzesTaken: 19,
    avgScore: 92,
    totalTime: '6h 15m',
    lastActive: '1 day ago',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike.w@example.com',
    initials: 'MW',
    quizzesTaken: 31,
    avgScore: 78,
    totalTime: '12h 45m',
    lastActive: '3 hours ago',
    status: 'Active'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    initials: 'ED',
    quizzesTaken: 15,
    avgScore: 95,
    totalTime: '4h 20m',
    lastActive: '5 days ago',
    status: 'Inactive'
  }
])

const engagementInsights = reactive([
  {
    title: 'Peak Activity Times',
    description: 'Users are most active between 2-4 PM and 7-9 PM',
    icon: ChartBarIcon
  },
  {
    title: 'Session Optimization',
    description: 'Users who complete quizzes in under 20 minutes have 15% higher retention',
    icon: LightBulbIcon
  },
  {
    title: 'Content Engagement',
    description: 'Math and Science quizzes show 25% higher completion rates',
    icon: ChartBarIcon
  },
  {
    title: 'Attention Required',
    description: 'Users abandoning quizzes after 5 minutes - consider content review',
    icon: ExclamationTriangleIcon
  }
])

// Methods
const exportData = () => {
  // Implement data export functionality
  const data = {
    metrics: engagementMetrics,
    users: topUsers,
    insights: engagementInsights,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `user-engagement-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  emit('data-exported', data)
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Inactive':
      return 'bg-gray-100 text-gray-800'
    case 'Suspended':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const createActivityChart = () => {
  const ctx = activityChart.value?.getContext('2d')
  if (!ctx) return

  charts.activity = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      datasets: [
        {
          label: 'Active Users',
          data: [12, 8, 45, 89, 156, 134, 67],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Quiz Completions',
          data: [5, 3, 23, 45, 78, 67, 34],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
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
          beginAtZero: true
        }
      }
    }
  })
}

const createSessionChart = () => {
  const ctx = sessionChart.value?.getContext('2d')
  if (!ctx) return

  charts.session = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['0-5m', '5-15m', '15-30m', '30-60m', '60m+'],
      datasets: [{
        label: 'Users',
        data: [45, 89, 156, 78, 23],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(99, 102, 241, 0.8)'
        ]
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

const createCompletionChart = () => {
  const ctx = completionChart.value?.getContext('2d')
  if (!ctx) return

  charts.completion = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Completed', 'In Progress', 'Abandoned'],
      datasets: [{
        data: [67, 18, 15],
        backgroundColor: [
          'rgb(16, 185, 129)',
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

const refreshCharts = () => {
  // Destroy existing charts
  Object.values(charts).forEach(chart => {
    if (chart) {
      chart.destroy()
    }
  })

  // Recreate charts
  createActivityChart()
  createSessionChart()
  createCompletionChart()
}

// Watchers
watch(selectedMetric, () => {
  // Update charts based on selected metric
  refreshCharts()
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  createActivityChart()
  createSessionChart()
  createCompletionChart()
})
</script>

<style scoped>
/* Custom styles for charts */
canvas {
  max-height: 100%;
  max-width: 100%;
}
</style>
