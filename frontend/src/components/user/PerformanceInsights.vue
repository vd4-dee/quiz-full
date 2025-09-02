<template>
  <div class="performance-insights-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 rounded w-1/4"></div>
        <div class="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="text-center py-12">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Analytics loading failed</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="loadAnalytics" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Main analytics content -->
    <div v-else class="main-content">
      <!-- Header with overview -->
      <div class="analytics-header bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Performance Insights</h1>
            <p class="text-gray-600">Track your learning progress and discover areas for improvement</p>
          </div>
          
          <!-- Time period selector -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-gray-600">Time Period:</label>
            <select
              v-model="selectedPeriod"
              @change="loadAnalytics"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        <!-- Quick stats overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="stat-card bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm">Total Quizzes</p>
                <p class="text-2xl font-bold">{{ overview.totalQuizzes }}</p>
              </div>
              <div class="text-blue-200 text-3xl">📊</div>
            </div>
          </div>
          
          <div class="stat-card bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Average Score</p>
                <p class="text-2xl font-bold">{{ overview.averageScore }}%</p>
              </div>
              <div class="text-green-200 text-3xl">🎯</div>
            </div>
          </div>
          
          <div class="stat-card bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm">Study Time</p>
                <p class="text-2xl font-bold">{{ overview.totalStudyTime }}h</p>
              </div>
              <div class="text-purple-200 text-3xl">⏱️</div>
            </div>
          </div>
          
          <div class="stat-card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-yellow-100 text-sm">Improvement</p>
                <p class="text-2xl font-bold">{{ overview.improvement }}%</p>
              </div>
              <div class="text-yellow-200 text-3xl">📈</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and insights grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Performance trends chart -->
        <div class="chart-card bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
          <div class="h-64 flex items-center justify-center">
            <canvas ref="trendsChart" class="w-full h-full"></canvas>
          </div>
        </div>

        <!-- Topic performance radar chart -->
        <div class="chart-card bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Topic Performance</h3>
          <div class="h-64 flex items-center justify-center">
            <canvas ref="radarChart" class="w-full h-full"></canvas>
          </div>
        </div>
      </div>

      <!-- Detailed insights and recommendations -->
      <div class="insights-section bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">Learning Insights & Recommendations</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Strengths -->
          <div class="insight-card">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-600 text-xl">💪</span>
              </div>
              <h4 class="text-lg font-medium text-gray-900">Your Strengths</h4>
            </div>
            <div class="space-y-3">
              <div
                v-for="strength in insights.strengths"
                :key="strength.topic"
                class="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <span class="text-sm font-medium text-gray-700">{{ strength.topic }}</span>
                <span class="text-sm text-green-600 font-semibold">{{ strength.score }}%</span>
              </div>
            </div>
          </div>

          <!-- Areas for improvement -->
          <div class="insight-card">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span class="text-red-600 text-xl">🎯</span>
              </div>
              <h4 class="text-lg font-medium text-gray-900">Areas for Improvement</h4>
            </div>
            <div class="space-y-3">
              <div
                v-for="weakness in insights.weaknesses"
                :key="weakness.topic"
                class="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <span class="text-sm font-medium text-gray-700">{{ weakness.topic }}</span>
                <span class="text-sm text-red-600 font-semibold">{{ weakness.score }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Study recommendations -->
      <div class="recommendations-section bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">Personalized Study Recommendations</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="recommendation in recommendations"
            :key="recommendation.id"
            class="recommendation-card p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div class="flex items-start gap-3 mb-3">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-blue-600 text-sm">{{ recommendation.icon }}</span>
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 mb-1">{{ recommendation.title }}</h4>
                <p class="text-sm text-gray-600">{{ recommendation.description }}</p>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">{{ recommendation.priority }}</span>
              <button
                @click="followRecommendation(recommendation)"
                class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full transition-colors"
              >
                Follow
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Goal tracking -->
      <div class="goals-section bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-900">Learning Goals & Progress</h3>
          <button
            @click="showGoalModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add Goal
          </button>
        </div>
        
        <div class="space-y-4">
          <div
            v-for="goal in learningGoals"
            :key="goal.id"
            class="goal-card p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center justify-between mb-3">
              <div>
                <h4 class="font-medium text-gray-900">{{ goal.title }}</h4>
                <p class="text-sm text-gray-600">{{ goal.description }}</p>
              </div>
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  goal.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ goal.status === 'completed' ? 'Completed' : 'In Progress' }}
              </span>
            </div>
            
            <div class="mb-3">
              <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{{ goal.progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${goal.progress}%` }"
                ></div>
              </div>
            </div>
            
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>Target: {{ goal.target }}</span>
              <span>Due: {{ formatDate(goal.dueDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Goal Modal -->
    <div
      v-if="showGoalModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showGoalModal = false"
    >
      <div
        class="bg-white rounded-lg max-w-md w-full p-6"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Learning Goal</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
            <input
              v-model="newGoal.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Improve Math Score"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              v-model="newGoal.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your goal..."
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Target</label>
              <input
                v-model="newGoal.target"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 90%"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                v-model="newGoal.dueDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div class="flex gap-3 mt-6">
          <button
            @click="showGoalModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="addGoal"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Goal
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import Chart from 'chart.js/auto'

// Store
const userStore = useUserStore()

// Reactive state
const loading = ref(false)
const error = ref(null)
const selectedPeriod = ref(30)
const showGoalModal = ref(false)
const trendsChart = ref(null)
const radarChart = ref(null)

// Analytics data
const overview = ref({
  totalQuizzes: 0,
  averageScore: 0,
  totalStudyTime: 0,
  improvement: 0
})

const insights = ref({
  strengths: [],
  weaknesses: []
})

const recommendations = ref([])
const learningGoals = ref([])

// New goal form
const newGoal = ref({
  title: '',
  description: '',
  target: '',
  dueDate: ''
})

// Computed properties
const chartData = computed(() => {
  // Mock data - replace with actual analytics data
  return {
    trends: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Average Score',
        data: [75, 78, 82, 85],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    },
    radar: {
      labels: ['Math', 'Science', 'History', 'Literature', 'Technology'],
      datasets: [{
        label: 'Your Performance',
        data: [85, 72, 90, 68, 78],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)'
      }]
    }
  }
})

// Methods
const loadAnalytics = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Mock data - replace with actual API call
    overview.value = {
      totalQuizzes: 24,
      averageScore: 82,
      totalStudyTime: 18,
      improvement: 12
    }
    
    insights.value = {
      strengths: [
        { topic: 'History', score: 90 },
        { topic: 'Literature', score: 88 },
        { topic: 'Technology', score: 85 }
      ],
      weaknesses: [
        { topic: 'Mathematics', score: 65 },
        { topic: 'Science', score: 72 }
      ]
    }
    
    recommendations.value = [
      {
        id: '1',
        icon: '📚',
        title: 'Focus on Math',
        description: 'Practice basic algebra concepts to improve your score',
        priority: 'High Priority'
      },
      {
        id: '2',
        icon: '🔬',
        title: 'Science Review',
        description: 'Review physics fundamentals for better understanding',
        priority: 'Medium Priority'
      },
      {
        id: '3',
        icon: '⏰',
        title: 'Study Schedule',
        description: 'Set aside 30 minutes daily for math practice',
        priority: 'Medium Priority'
      }
    ]
    
    learningGoals.value = [
      {
        id: '1',
        title: 'Improve Math Score',
        description: 'Achieve 80% or higher in mathematics quizzes',
        target: '80%',
        progress: 65,
        status: 'in_progress',
        dueDate: '2024-02-15'
      },
      {
        id: '2',
        title: 'Complete 30 Quizzes',
        description: 'Take and complete 30 quizzes this month',
        target: '30 quizzes',
        progress: 80,
        status: 'in_progress',
        dueDate: '2024-01-31'
      }
    ]
    
    // Initialize charts after data loads
    await nextTick()
    initializeCharts()
    
  } catch (err) {
    error.value = err.message || 'Failed to load analytics'
  } finally {
    loading.value = false
  }
}

const initializeCharts = () => {
  // Initialize trends chart
  if (trendsChart.value) {
    new Chart(trendsChart.value, {
      type: 'line',
      data: chartData.value.trends,
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
  
  // Initialize radar chart
  if (radarChart.value) {
    new Chart(radarChart.value, {
      type: 'radar',
      data: chartData.value.radar,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    })
  }
}

const followRecommendation = (recommendation) => {
  // Implementation for following recommendations
  console.log('Following recommendation:', recommendation.title)
}

const addGoal = () => {
  if (!newGoal.value.title || !newGoal.value.description) return
  
  const goal = {
    id: Date.now().toString(),
    ...newGoal.value,
    progress: 0,
    status: 'in_progress'
  }
  
  learningGoals.value.push(goal)
  
  // Reset form
  newGoal.value = {
    title: '',
    description: '',
    target: '',
    dueDate: ''
  }
  
  showGoalModal.value = false
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadAnalytics()
})

// Watch for period changes
watch(selectedPeriod, () => {
  loadAnalytics()
})
</script>

<style scoped>
.performance-insights-container {
  @apply min-h-screen bg-gray-50 py-8;
}

.loading-container,
.error-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.main-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.stat-card {
  @apply transform hover:scale-105 transition-transform;
}

.chart-card {
  @apply min-h-80;
}

.insight-card {
  @apply p-4 border border-gray-200 rounded-lg;
}

.recommendation-card {
  @apply cursor-pointer;
}

.goal-card {
  @apply hover:shadow-md transition-shadow;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .analytics-header .grid {
    @apply grid-cols-2;
  }
  
  .insights-section .grid {
    @apply grid-cols-1;
  }
  
  .recommendations-section .grid {
    @apply grid-cols-1;
  }
}
</style>
