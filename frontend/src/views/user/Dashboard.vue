<template>
  <UserLayout>
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2">
            {{ getGreeting() }}, {{ user?.name || user?.email || 'Student' }}! 👋
          </h1>
          <p class="text-blue-100 text-lg">
            Ready to test your knowledge? Choose from our available quizzes below.
          </p>
          <div class="mt-4 flex items-center space-x-6">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              <span class="text-blue-100">Current streak: {{ userStats.streak }} days</span>
            </div>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-yellow-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="text-blue-100">Progress: {{ userStats.progress }}%</span>
            </div>
          </div>
        </div>
        <div class="mt-6 lg:mt-0">
          <UserStats :stats="userStats" />
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-3">
          <!-- Quiz Filters -->
          <QuizFilters 
            v-model:category="filters.category"
            v-model:difficulty="filters.difficulty"
            v-model:status="filters.status"
            v-model:search="filters.search"
            @filter-change="handleFilterChange"
          />

          <!-- Available Quizzes -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900">
                Available Quizzes ({{ filteredQuizzes.length }})
              </h2>
              <div class="text-sm text-gray-500">
                Showing {{ filteredQuizzes.length }} of {{ quizzes.length }} quizzes
              </div>
            </div>

            <div v-if="loading" class="flex justify-center py-12">
              <LoadingSpinner />
            </div>

            <div v-else-if="error" class="text-center py-12">
              <div class="text-red-400">
                <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5C3.314 16.333 4.272 18 5.814 18z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Quizzes</h3>
                <p class="text-gray-500 mb-4">{{ error }}</p>
                <button 
                  @click="refreshData"
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            </div>

            <div v-else-if="filteredQuizzes.length === 0" class="text-center py-12">
              <div class="text-gray-400">
                <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
                <p class="text-gray-500">
                  {{ filters.search ? 'No quizzes match your search criteria.' : 'Check back later for new quizzes!' }}
                </p>
              </div>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <QuizCard
                v-for="quiz in filteredQuizzes"
                :key="quiz.id"
                :quiz="quiz"
                :user-submissions="userSubmissions"
                @start-quiz="startQuizById"
                @continue-quiz="continueQuiz"
                @review-results="reviewResults"
              />
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Recent Activity -->
          <RecentActivity :activities="recentActivities" />
          
          <!-- Performance Trend -->
          <div class="mt-6">
            <PerformanceTrend :performance-data="performanceData" />
          </div>

          <!-- Achievement Badges -->
          <div class="mt-6">
            <AchievementBadges :badges="achievementBadges" />
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Quizzes</p>
            <p class="text-2xl font-bold text-gray-900">{{ userStats.quizzesCompleted }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Average Score</p>
            <p class="text-2xl font-bold text-gray-900">{{ userStats.averageScore }}%</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Current Rank</p>
            <p class="text-2xl font-bold text-gray-900">#{{ userStats.currentRank || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div class="flex items-center">
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Time Spent</p>
            <p class="text-2xl font-bold text-gray-900">{{ userStats.timeSpent }}</p>
          </div>
        </div>
      </div>
    </div>


  </UserLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useQuizStore } from '../../stores/quiz'
import UserLayout from '../../components/user/UserLayout.vue'
import UserStats from '../../components/user/UserStats.vue'
import QuizFilters from '../../components/user/QuizFilters.vue'
import QuizCard from '../../components/user/QuizCard.vue'
import RecentActivity from '../../components/user/RecentActivity.vue'
import PerformanceTrend from '../../components/user/PerformanceTrend.vue'
import AchievementBadges from '../../components/user/AchievementBadges.vue'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()
const quizStore = useQuizStore()

// Reactive data
const loading = ref(true)
const error = ref(null)
const quizzes = ref([])
const userSubmissions = ref([])
const recentActivities = ref([])
const performanceData = ref([])
const achievementBadges = ref([])


// Computed properties
const user = computed(() => authStore.user)



const userStats = computed(() => ({
  quizzesCompleted: userSubmissions.value.filter(s => s.completed_at).length,
  averageScore: calculateAverageScore(),
  timeSpent: calculateTotalTimeSpent(),
  progressStreak: calculateProgressStreak(),
  streak: calculateProgressStreak(),
  progress: Math.round((userSubmissions.value.filter(s => s.completed_at).length / quizzes.value.length) * 100) || 0,
  currentRank: 3 // Mock data - replace with real ranking calculation
}))

// Get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const filteredQuizzes = computed(() => {
  let filtered = quizzes.value

  // Category filter
  if (filters.value.category !== 'All') {
    filtered = filtered.filter(quiz => quiz.category === filters.value.category)
  }

  // Difficulty filter
  if (filters.value.difficulty !== 'All') {
    filtered = filtered.filter(quiz => quiz.level === filters.value.difficulty)
  }

  // Status filter
  if (filters.value.status !== 'All') {
    filtered = filtered.filter(quiz => {
      const submission = userSubmissions.value.find(s => s.quiz === quiz.id)
      if (filters.value.status === 'Available') return !submission || !submission.completed_at
      if (filters.value.status === 'Completed') return submission && submission.completed_at
      if (filters.value.status === 'In Progress') return submission && !submission.completed_at
      return true
    })
  }

  // Search filter
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    filtered = filtered.filter(quiz => 
      quiz.title.toLowerCase().includes(searchLower) ||
      quiz.description?.toLowerCase().includes(searchLower)
    )
  }

  return filtered
})

// Filters
const filters = ref({
  category: 'All',
  difficulty: 'All',
  status: 'Available',
  search: ''
})

// Methods
const handleFilterChange = () => {
  // Filters are reactive, no additional logic needed
}



const refreshData = async () => {
  try {
    loading.value = true
    error.value = null
    await loadDashboardData()
  } catch (err) {
    error.value = err.message
    console.error('Error refreshing data:', err)
  } finally {
    loading.value = false
  }
}

const loadDashboardData = async () => {
  try {
    console.log('Loading dashboard data...')
    
    // Load quizzes and user submissions in parallel
    const [quizzesData, submissionsData] = await Promise.all([
      quizStore.loadAvailableQuizzes(),
      quizStore.getUserSubmissions(user.value?.id)
    ])
    
    quizzes.value = quizzesData
    userSubmissions.value = submissionsData
    
    console.log('Dashboard data loaded successfully', { 
      quizzes: quizzesData.length, 
      submissions: submissionsData.length 
    })
    
    // Generate mock data for demo purposes
    generateMockData()
    
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    // Set empty arrays on error to prevent undefined errors
    quizzes.value = []
    userSubmissions.value = []
    throw error
  }
}

const startQuizById = (quizId) => {
  router.push(`/quiz/${quizId}`)
}

const continueQuiz = (quizId) => {
  router.push(`/quiz/${quizId}`)
}

const reviewResults = (quizId) => {
  router.push(`/results/${quizId}`)
}

const calculateAverageScore = () => {
  const completedSubmissions = userSubmissions.value.filter(s => s.completed_at && s.score !== null)
  if (completedSubmissions.length === 0) return 0
  
  const totalScore = completedSubmissions.reduce((sum, s) => sum + s.score, 0)
  return Math.round(totalScore / completedSubmissions.length)
}

const calculateTotalTimeSpent = () => {
  const completedSubmissions = userSubmissions.value.filter(s => s.completed_at)
  if (completedSubmissions.length === 0) return 0
  
  return completedSubmissions.reduce((total, s) => {
    if (s.started_at && s.completed_at) {
      const duration = new Date(s.completed_at) - new Date(s.started_at)
      return total + Math.round(duration / 60000) // Convert to minutes
    }
    return total
  }, 0)
}

const calculateProgressStreak = () => {
  // Simple streak calculation - can be enhanced later
  const completedSubmissions = userSubmissions.value
    .filter(s => s.completed_at)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
  
  if (completedSubmissions.length === 0) return 0
  
  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 1; i < completedSubmissions.length; i++) {
    const currentDate = new Date(completedSubmissions[i].completed_at)
    currentDate.setHours(0, 0, 0, 0)
    
    const prevDate = new Date(completedSubmissions[i - 1].completed_at)
    prevDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

// Load data on mount
onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    
    // Load dashboard data
    await loadDashboardData()
    
  } catch (err) {
    error.value = err.message
    console.error('Error loading dashboard:', err)
  } finally {
    loading.value = false
  }
})

// Mock data generation for development
const generateMockData = () => {
  // Recent activities
  recentActivities.value = [
    {
      id: 1,
      type: 'quiz_completed',
      quizName: 'Python Basics',
      score: 85,
      date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 2,
      type: 'quiz_started',
      quizName: 'Excel Formulas',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: 3,
      type: 'quiz_completed',
      quizName: 'Pandas Data Analysis',
      score: 92,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    }
  ]

  // Performance data
  performanceData.value = [
    { date: '2024-01-01', score: 75 },
    { date: '2024-01-03', score: 82 },
    { date: '2024-01-05', score: 78 },
    { date: '2024-01-07', score: 85 },
    { date: '2024-01-09', score: 90 },
    { date: '2024-01-11', score: 88 },
    { date: '2024-01-13', score: 92 }
  ]

  // Achievement badges
  achievementBadges.value = [
    { id: 1, name: 'First Quiz', description: 'Completed your first quiz', icon: '🎯', unlocked: true },
    { id: 2, name: 'Streak Master', description: '5 days in a row', icon: '🔥', unlocked: true },
    { id: 3, name: 'Perfect Score', description: '100% on any quiz', icon: '🏆', unlocked: false },
    { id: 4, name: 'Speed Demon', description: 'Complete quiz in half time', icon: '⚡', unlocked: false }
  ]
}


</script>
