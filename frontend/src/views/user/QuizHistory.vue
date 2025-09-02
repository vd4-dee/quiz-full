<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Quiz History</h1>
        <p class="text-gray-600">Track your progress and review past attempts</p>
      </div>

      <!-- Filters -->
      <div class="mb-6">
        <HistoryFilters
          v-model:date-range="filters.dateRange"
          v-model:category="filters.category"
          v-model:score-range="filters.scoreRange"
          v-model:status="filters.status"
          v-model:search="filters.search"
          @filter-change="handleFilterChange"
        />
      </div>

      <!-- Performance Overview -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Total Quizzes</h3>
          <div class="text-3xl font-bold text-blue-600">{{ totalQuizzes }}</div>
          <div class="text-sm text-gray-500 mt-1">Completed</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Average Score</h3>
          <div class="text-3xl font-bold text-green-600">{{ averageScore }}%</div>
          <div class="text-sm text-gray-500 mt-1">Overall Performance</div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Best Score</h3>
          <div class="text-3xl font-bold text-purple-600">{{ bestScore }}%</div>
          <div class="text-sm text-gray-500 mt-1">Highest Achievement</div>
        </div>
      </div>

      <!-- Performance Trends -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <TrendAnalysis :performance-data="performanceData" />
      </div>

      <!-- Quiz History Table -->
      <div class="bg-white rounded-lg shadow-sm border">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Quiz Attempts</h3>
            <div class="text-sm text-gray-500">
              Showing {{ filteredSubmissions.length }} of {{ submissions.length }} attempts
            </div>
          </div>
        </div>
        
        <HistoryTable
          :submissions="filteredSubmissions"
          @view-details="viewSubmissionDetails"
          @retake-quiz="retakeQuiz"
        />
      </div>
    </div>

    <!-- Submission Details Modal -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Quiz Details</h3>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600"
            @click="showDetailsModal = false"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div v-if="selectedSubmission" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-500">Quiz:</span>
              <div class="text-sm text-gray-900">{{ selectedSubmission.quiz_title }}</div>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Score:</span>
              <div class="text-sm text-gray-900">{{ selectedSubmission.score }}%</div>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Date:</span>
              <div class="text-sm text-gray-900">{{ formatDate(selectedSubmission.completed_at) }}</div>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-500">Time:</span>
              <div class="text-sm text-gray-900">{{ formatTime(selectedSubmission.time_taken) }}</div>
            </div>
          </div>
          
          <div class="pt-4 border-t border-gray-200">
            <button
              type="button"
              class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              @click="viewFullResults"
            >
              View Full Results
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../../stores/quiz'
import HistoryFilters from '../../components/user/HistoryFilters.vue'
import HistoryTable from '../../components/user/HistoryTable.vue'
import TrendAnalysis from '../../components/user/TrendAnalysis.vue'

const router = useRouter()
const quizStore = useQuizStore()

// Reactive data
const submissions = ref([])
const loading = ref(true)
const showDetailsModal = ref(false)
const selectedSubmission = ref(null)

// Filters
const filters = ref({
  dateRange: 'all',
  category: 'All',
  scoreRange: 'all',
  status: 'All',
  search: ''
})

// Computed properties
const filteredSubmissions = computed(() => {
  let filtered = submissions.value

  // Date range filter
  if (filters.value.dateRange !== 'all') {
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (filters.value.dateRange) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    filtered = filtered.filter(s => new Date(s.completed_at) >= cutoffDate)
  }

  // Category filter
  if (filters.value.category !== 'All') {
    filtered = filtered.filter(s => s.quiz_category === filters.value.category)
  }

  // Score range filter
  if (filters.value.scoreRange !== 'all') {
    const [min, max] = filters.value.scoreRange.split('-').map(Number)
    filtered = filtered.filter(s => s.score >= min && s.score <= max)
  }

  // Status filter
  if (filters.value.status !== 'All') {
    filtered = filtered.filter(s => {
      if (filters.value.status === 'Completed') return s.completed_at
      if (filters.value.status === 'In Progress') return !s.completed_at
      return true
    })
  }

  // Search filter
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    filtered = filtered.filter(s => 
      s.quiz_title.toLowerCase().includes(searchLower) ||
      s.quiz_category.toLowerCase().includes(searchLower)
    )
  }

  return filtered
})

const totalQuizzes = computed(() => {
  return submissions.value.filter(s => s.completed_at).length
})

const averageScore = computed(() => {
  const completedSubmissions = submissions.value.filter(s => s.completed_at && s.score !== null)
  if (completedSubmissions.length === 0) return 0
  
  const totalScore = completedSubmissions.reduce((sum, s) => sum + s.score, 0)
  return Math.round(totalScore / completedSubmissions.length)
})

const bestScore = computed(() => {
  const completedSubmissions = submissions.value.filter(s => s.completed_at && s.score !== null)
  if (completedSubmissions.length === 0) return 0
  
  return Math.max(...completedSubmissions.map(s => s.score))
})

const performanceData = computed(() => {
  // Generate performance data for the last 10 quizzes
  const recentSubmissions = submissions.value
    .filter(s => s.completed_at)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
    .slice(0, 10)
    .reverse()
  
  return recentSubmissions.map((s, index) => ({
    date: `Quiz ${index + 1}`,
    score: s.score
  }))
})

// Methods
const handleFilterChange = () => {
  // Filters are reactive, no additional logic needed
}

const viewSubmissionDetails = (submission) => {
  selectedSubmission.value = submission
  showDetailsModal.value = true
}

const viewFullResults = () => {
  if (selectedSubmission.value) {
    router.push(`/results/${selectedSubmission.value.id}`)
  }
  showDetailsModal.value = false
}

const retakeQuiz = (quizId) => {
  router.push(`/quiz/${quizId}`)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (seconds) => {
  if (!seconds) return 'N/A'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Load data on mount
onMounted(async () => {
  try {
    loading.value = true
    
    // Load user submissions
    const submissionsData = await quizStore.getUserSubmissions()
    submissions.value = submissionsData
    
  } catch (error) {
    console.error('Error loading quiz history:', error)
  } finally {
    loading.value = false
  }
})
</script>
