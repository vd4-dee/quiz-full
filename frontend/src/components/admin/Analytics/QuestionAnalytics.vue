<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Question Analytics</h3>
        <p class="text-sm text-gray-600">Analyze question effectiveness and performance metrics</p>
      </div>
      <div class="flex items-center space-x-3">
        <select 
          v-model="selectedCategory" 
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option value="math">Mathematics</option>
          <option value="science">Science</option>
          <option value="history">History</option>
          <option value="literature">Literature</option>
          <option value="geography">Geography</option>
        </select>
        <select 
          v-model="selectedDifficulty" 
          class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button 
          @click="generateReport"
          :disabled="isGenerating"
          class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 text-sm"
        >
          <span v-if="isGenerating">Generating...</span>
          <span v-else>Generate Report</span>
        </button>
      </div>
    </div>

    <!-- Question Performance Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div 
        v-for="metric in questionMetrics" 
        :key="metric.label"
        class="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-purple-600">{{ metric.label }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ metric.value }}</p>
          </div>
          <div class="p-2 bg-purple-100 rounded-full">
            <component :is="metric.icon" class="w-5 h-5 text-purple-600" />
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

    <!-- Question Effectiveness Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Success Rate by Category -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-semibold text-gray-900 mb-4">Success Rate by Category</h4>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="categoryChart" class="w-full h-full"></canvas>
        </div>
      </div>

      <!-- Difficulty vs Success Rate -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-md font-semibold text-gray-900 mb-4">Difficulty vs Success Rate</h4>
        <div class="h-64 flex items-center justify-center">
          <canvas ref="difficultyChart" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>

    <!-- Question Performance Heatmap -->
    <div class="bg-gray-50 p-4 rounded-lg mb-6">
      <h4 class="text-md font-semibold text-gray-900 mb-4">Question Performance Heatmap</h4>
      <div class="overflow-x-auto">
        <div class="inline-block min-w-full">
          <div class="grid grid-cols-8 gap-1">
            <div 
              v-for="(question, index) in questionHeatmap" 
              :key="index"
              :class="getHeatmapClass(question.successRate)"
              class="w-12 h-12 rounded flex items-center justify-center text-xs font-medium text-white cursor-pointer hover:scale-110 transition-transform"
              :title="`Question ${index + 1}: ${question.successRate}% success rate`"
            >
              {{ Math.round(question.successRate) }}%
            </div>
          </div>
        </div>
      </div>
      <div class="mt-3 flex items-center justify-center space-x-4 text-sm">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span>Low (0-40%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
          <span>Medium (41-70%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span>High (71-100%)</span>
        </div>
      </div>
    </div>

    <!-- Top Performing Questions -->
    <div class="mb-6">
      <h4 class="text-md font-semibold text-gray-900 mb-4">Top Performing Questions</h4>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="question in topQuestions" :key="question.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="max-w-xs truncate">
                  <p class="text-sm font-medium text-gray-900">{{ question.text }}</p>
                  <p class="text-xs text-gray-500">{{ question.type }}</p>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getCategoryClass(question.category)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ question.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getDifficultyClass(question.difficulty)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ question.difficulty }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      :class="getSuccessRateClass(question.successRate)"
                      class="h-2 rounded-full"
                      :style="{ width: question.successRate + '%' }"
                    ></div>
                  </div>
                  <span class="text-sm text-gray-900">{{ question.successRate }}%</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ question.attempts }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ question.avgTime }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  @click="previewQuestion(question)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Preview
                </button>
                <button 
                  @click="editQuestion(question)"
                  class="text-green-600 hover:text-green-900"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Question Insights -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h4 class="text-md font-semibold text-yellow-900 mb-3">Question Insights & Recommendations</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="insight in questionInsights" :key="insight.title" class="flex items-start">
          <div class="flex-shrink-0">
            <component :is="insight.icon" class="w-5 h-5 text-yellow-600 mt-0.5" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-yellow-900">{{ insight.title }}</p>
            <p class="text-sm text-yellow-700">{{ insight.description }}</p>
            <p class="text-xs text-yellow-600 mt-1">{{ insight.recommendation }}</p>
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
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'

// Register Chart.js components
Chart.register(...registerables)

// Props
const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  quizResults: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['question-preview', 'question-edit', 'report-generated'])

// Reactive state
const selectedCategory = ref('')
const selectedDifficulty = ref('')
const isGenerating = ref(false)

// Chart references
const categoryChart = ref(null)
const difficultyChart = ref(null)

// Chart instances
let charts = {
  category: null,
  difficulty: null
}

// Sample data - replace with actual API calls
const questionMetrics = reactive([
  {
    label: 'Total Questions',
    value: '1,234',
    trend: 8.5,
    icon: AcademicCapIcon
  },
  {
    label: 'Avg Success Rate',
    value: '72.3%',
    trend: 5.2,
    icon: ChartBarIcon
  },
  {
    label: 'Avg Response Time',
    value: '45s',
    trend: -3.1,
    icon: ClockIcon
  },
  {
    label: 'Quality Score',
    value: '8.7/10',
    trend: 12.1,
    icon: ChartBarIcon
  }
])

const questionHeatmap = reactive(Array.from({ length: 64 }, () => ({
  successRate: Math.random() * 100
})))

const topQuestions = reactive([
  {
    id: 1,
    text: 'What is the capital of France?',
    type: 'Multiple Choice',
    category: 'Geography',
    difficulty: 'Easy',
    successRate: 95,
    attempts: 156,
    avgTime: '12s'
  },
  {
    id: 2,
    text: 'Solve for x: 2x + 5 = 13',
    type: 'Short Answer',
    category: 'Mathematics',
    difficulty: 'Medium',
    successRate: 87,
    attempts: 134,
    avgTime: '45s'
  },
  {
    id: 3,
    text: 'Which planet is closest to the Sun?',
    type: 'Multiple Choice',
    category: 'Science',
    difficulty: 'Easy',
    successRate: 92,
    attempts: 189,
    avgTime: '8s'
  },
  {
    id: 4,
    text: 'Who wrote "Romeo and Juliet"?',
    type: 'Multiple Choice',
    category: 'Literature',
    difficulty: 'Medium',
    successRate: 78,
    attempts: 98,
    avgTime: '23s'
  }
])

const questionInsights = reactive([
  {
    title: 'High Abandonment Rate',
    description: '15% of questions are abandoned after 30 seconds',
    recommendation: 'Review question clarity and reduce complexity',
    icon: ExclamationTriangleIcon
  },
  {
    title: 'Difficulty Mismatch',
    description: 'Easy questions have 25% lower success rate than expected',
    recommendation: 'Reassess difficulty classification and content',
    icon: LightBulbIcon
  },
  {
    title: 'Category Performance Gap',
    description: 'Science questions outperform History by 18%',
    recommendation: 'Analyze content quality and question design',
    icon: ChartBarIcon
  },
  {
    title: 'Time Optimization',
    description: 'Questions answered in under 20s have 90% accuracy',
    recommendation: 'Focus on clear, concise question formulation',
    icon: ClockIcon
  }
])

// Methods
const generateReport = async () => {
  isGenerating.value = true
  try {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update analytics data
    updateAnalytics()
    
    // Refresh charts
    await nextTick()
    refreshCharts()
    
    emit('report-generated', {
      category: selectedCategory.value,
      difficulty: selectedDifficulty.value,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating report:', error)
  } finally {
    isGenerating.value = false
  }
}

const updateAnalytics = () => {
  // Update analytics based on selected filters
  console.log('Updating analytics for:', { category: selectedCategory.value, difficulty: selectedDifficulty.value })
}

const previewQuestion = (question) => {
  emit('question-preview', question)
}

const editQuestion = (question) => {
  emit('question-edit', question)
}

const getHeatmapClass = (successRate) => {
  if (successRate < 40) return 'bg-red-500'
  if (successRate < 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

const getCategoryClass = (category) => {
  const classes = {
    'Mathematics': 'bg-blue-100 text-blue-800',
    'Science': 'bg-green-100 text-green-800',
    'History': 'bg-yellow-100 text-yellow-800',
    'Literature': 'bg-purple-100 text-purple-800',
    'Geography': 'bg-indigo-100 text-indigo-800'
  }
  return classes[category] || 'bg-gray-100 text-gray-800'
}

const getDifficultyClass = (difficulty) => {
  const classes = {
    'Easy': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Hard': 'bg-red-100 text-red-800'
  }
  return classes[difficulty] || 'bg-gray-100 text-gray-800'
}

const getSuccessRateClass = (successRate) => {
  if (successRate < 40) return 'bg-red-500'
  if (successRate < 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

const createCategoryChart = () => {
  const ctx = categoryChart.value?.getContext('2d')
  if (!ctx) return

  charts.category = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Math', 'Science', 'History', 'Literature', 'Geography'],
      datasets: [{
        label: 'Success Rate (%)',
        data: [78, 85, 65, 72, 80],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(168, 85, 247, 0.8)',
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
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Easy',
          data: [
            { x: 15, y: 92 },
            { x: 18, y: 88 },
            { x: 22, y: 85 }
          ],
          backgroundColor: 'rgba(34, 197, 94, 0.8)'
        },
        {
          label: 'Medium',
          data: [
            { x: 35, y: 78 },
            { x: 42, y: 75 },
            { x: 38, y: 82 }
          ],
          backgroundColor: 'rgba(245, 158, 11, 0.8)'
        },
        {
          label: 'Hard',
          data: [
            { x: 65, y: 45 },
            { x: 72, y: 38 },
            { x: 58, y: 52 }
          ],
          backgroundColor: 'rgba(239, 68, 68, 0.8)'
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
        x: {
          title: {
            display: true,
            text: 'Average Response Time (seconds)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Success Rate (%)'
          },
          beginAtZero: true,
          max: 100
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
  createCategoryChart()
  createDifficultyChart()
}

// Watchers
watch([selectedCategory, selectedDifficulty], () => {
  // Update analytics when filters change
  updateAnalytics()
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  createCategoryChart()
  createDifficultyChart()
})
</script>

<style scoped>
/* Custom styles for charts */
canvas {
  max-height: 100%;
  max-width: 100%;
}
</style>
