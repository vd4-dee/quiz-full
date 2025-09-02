<template>
  <UserLayout>
    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span class="ml-3 text-lg text-gray-600">Loading leaderboard data...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-8 mb-8">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-medium text-red-800">Error Loading Leaderboard</h3>
          <p class="text-red-700">{{ error }}</p>
          <button @click="loadLeaderboardData" class="mt-2 text-red-600 hover:text-red-500 underline">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Hero Section -->
    <div v-else class="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl shadow-lg p-8 text-white mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2">Leaderboard</h1>
          <p class="text-purple-100 text-lg">
            Compete with your peers and track your ranking
          </p>
        </div>
        <div class="mt-6 lg:mt-0">
          <div class="text-center">
            <div class="text-4xl font-bold">#{{ userRank }}</div>
            <div class="text-purple-100">Your Current Rank</div>
            <div v-if="userRank !== 'N/A'" class="text-sm text-purple-200 mt-1">
              Out of {{ totalUsers }} users
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Controls -->
    <div v-if="!loading && !error" class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
          <select v-model="filters.timePeriod" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select v-model="filters.category" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="all">All Categories</option>
            <option value="excel">Excel</option>
            <option value="python">Python</option>
            <option value="pandas">Pandas</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select v-model="filters.difficulty" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
            <option value="very-hard">Very Hard</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabbed Leaderboard -->
    <div v-if="!loading && !error" class="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
      <!-- Tab Navigation -->
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8 px-6" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <div class="flex items-center">
              <component :is="tab.icon" class="w-5 h-5 mr-2" />
              {{ tab.name }}
            </div>
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        <!-- Overall Rankings Tab -->
        <div v-if="activeTab === 'overall'" class="space-y-4">
          <div 
            v-for="(student, index) in topPerformers" 
            :key="student.userId"
            :class="[
              'flex items-center p-4 rounded-lg border transition-all duration-200 hover:shadow-md',
              student.userId === currentUserId 
                ? 'bg-blue-50 border-blue-200 shadow-md' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            ]"
          >
            <!-- Rank -->
            <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4"
                 :class="getRankClass(index + 1)">
              {{ index + 1 }}
            </div>

            <!-- Student Info -->
            <div class="flex-1">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                  <span class="text-white text-sm font-medium">{{ getInitials(student.name) }}</span>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">
                    {{ student.userId === currentUserId ? 'You' : student.name }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ student.category }}</p>
                </div>
              </div>
            </div>

            <!-- Metrics -->
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{{ student.averageScore }}%</div>
              <div class="text-sm text-gray-500">{{ student.totalQuizzes }} quizzes</div>
            </div>

            <!-- Badge -->
            <div class="ml-4">
              <span v-if="index === 0" class="text-2xl">🥇</span>
              <span v-else-if="index === 1" class="text-2xl">🥈</span>
              <span v-else-if="index === 2" class="text-2xl">🥉</span>
              <span v-else class="text-gray-400">#{{ index + 1 }}</span>
            </div>
          </div>
        </div>

        <!-- Total Points Tab -->
        <div v-if="activeTab === 'points'" class="space-y-4">
          <div 
            v-for="(student, index) in totalPointsRankings" 
            :key="student.userId"
            :class="[
              'flex items-center p-4 rounded-lg border transition-all duration-200 hover:shadow-md',
              student.userId === currentUserId 
                ? 'bg-yellow-50 border-yellow-200 shadow-md' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            ]"
          >
            <!-- Rank -->
            <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4"
                 :class="getRankClass(index + 1)">
              {{ index + 1 }}
            </div>

            <!-- Student Info -->
            <div class="flex-1">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mr-3">
                  <span class="text-white text-sm font-medium">{{ getInitials(student.name) }}</span>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">
                    {{ student.userId === currentUserId ? 'You' : student.name }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ student.totalQuizzes }} quizzes</p>
                </div>
              </div>
            </div>

            <!-- Metrics -->
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{{ student.totalPoints }}</div>
              <div class="text-sm text-gray-500">total points</div>
            </div>

            <!-- Badge -->
            <div class="ml-4">
              <span v-if="index === 0" class="text-2xl">🏆</span>
              <span v-else-if="index === 1" class="text-2xl">🥈</span>
              <span v-else-if="index === 2" class="text-2xl">🥉</span>
              <span v-else class="text-gray-400">#{{ index + 1 }}</span>
            </div>
          </div>
        </div>

        <!-- Unique Questions Tab -->
        <div v-if="activeTab === 'questions'" class="space-y-4">
          <div 
            v-for="(student, index) in uniqueQuestionsRankings" 
            :key="student.userId"
            :class="[
              'flex items-center p-4 rounded-lg border transition-all duration-200 hover:shadow-md',
              student.userId === currentUserId 
                ? 'bg-indigo-50 border-indigo-200 shadow-md' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            ]"
          >
            <!-- Rank -->
            <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4"
                 :class="getRankClass(index + 1)">
              {{ index + 1 }}
            </div>

            <!-- Student Info -->
            <div class="flex-1">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                  <span class="text-white text-sm font-medium">{{ getInitials(student.name) }}</span>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">
                    {{ student.userId === currentUserId ? 'You' : student.name }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ student.totalQuizzes }} quizzes</p>
                </div>
              </div>
            </div>

            <!-- Metrics -->
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{{ student.uniqueQuestionsAnswered }}</div>
              <div class="text-sm text-gray-500">unique questions</div>
            </div>

            <!-- Badge -->
            <div class="ml-4">
              <span v-if="index === 0" class="text-2xl">🧠</span>
              <span v-else-if="index === 1" class="text-2xl">🥈</span>
              <span v-else-if="index === 2" class="text-2xl">🥉</span>
              <span v-else class="text-gray-400">#{{ index + 1 }}</span>
            </div>
          </div>
        </div>

        <!-- Accuracy Rate Tab -->
        <div v-if="activeTab === 'accuracy'" class="space-y-4">
          <div 
            v-for="(student, index) in accuracyRankings" 
            :key="student.userId"
            :class="[
              'flex items-center p-4 rounded-lg border transition-all duration-200 hover:shadow-md',
              student.userId === currentUserId 
                ? 'bg-green-50 border-green-200 shadow-md' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            ]"
          >
            <!-- Rank -->
            <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4"
                 :class="getRankClass(index + 1)">
              {{ index + 1 }}
            </div>

            <!-- Student Info -->
            <div class="flex-1">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                  <span class="text-white text-sm font-medium">{{ getInitials(student.name) }}</span>
                </div>
                <div>
                  <h3 class="font-medium text-gray-900">
                    {{ student.userId === currentUserId ? 'You' : student.name }}
                  </h3>
                  <p class="text-sm text-gray-500">{{ student.totalQuestionsAttempted }} questions</p>
                </div>
              </div>
            </div>

            <!-- Metrics -->
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{{ student.accuracyRate }}%</div>
              <div class="text-sm text-gray-500">accuracy rate</div>
            </div>

            <!-- Badge -->
            <div class="ml-4">
              <span v-if="index === 0" class="text-2xl">🎯</span>
              <span v-else-if="index === 1" class="text-2xl">🥈</span>
              <span v-else-if="index === 2" class="text-2xl">🥉</span>
              <span v-else class="text-gray-400">#{{ index + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Leaders -->
    <div v-if="!loading && !error" class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Excel Expert</h3>
        <div class="space-y-3">
          <div v-for="(expert, index) in categoryLeaders.excel" :key="expert.id" class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-700 mr-2">#{{ index + 1 }}</span>
              <span class="text-sm text-gray-900">{{ expert.name }}</span>
            </div>
            <span class="text-sm font-semibold text-blue-600">{{ expert.score }}%</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Python Ninja</h3>
        <div class="space-y-3">
          <div v-for="(ninja, index) in categoryLeaders.python" :key="ninja.id" class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-700 mr-2">#{{ index + 1 }}</span>
              <span class="text-sm text-gray-900">{{ ninja.name }}</span>
            </div>
            <span class="text-sm font-semibold text-green-600">{{ ninja.score }}%</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Pandas Master</h3>
        <div class="space-y-3">
          <div v-for="(master, index) in categoryLeaders.pandas" :key="master.id" class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-700 mr-2">#{{ index + 1 }}</span>
              <span class="text-sm text-gray-900">{{ master.name }}</span>
            </div>
            <span class="text-sm font-semibold text-purple-600">{{ master.score }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievement Showcase -->
    <div v-if="!loading && !error" class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-6">Recent Achievements</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="achievement in recentAchievements" :key="achievement.id" 
             class="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div class="text-3xl mb-2">{{ achievement.icon }}</div>
          <h4 class="font-medium text-gray-900 mb-1">{{ achievement.name }}</h4>
          <p class="text-sm text-gray-600">{{ achievement.student }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ formatDate(achievement.date) }}</p>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { leaderboardService } from '../../services/leaderboardService'
import { realtimeService } from '../../services/realtimeService'
import UserLayout from '../../components/user/UserLayout.vue'

// Icon components
const TrophyIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  `
}

const StarIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  `
}

const QuestionMarkCircleIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const TargetIcon = {
  template: `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const authStore = useAuthStore()

// Reactive data
const filters = ref({
  timePeriod: 'week',
  category: 'all',
  difficulty: 'all'
})

const topPerformers = ref([])
const totalPointsRankings = ref([])
const uniqueQuestionsRankings = ref([])
const accuracyRankings = ref([])
const categoryLeaders = ref({
  excel: [],
  python: [],
  pandas: []
})
const recentAchievements = ref([])
const loading = ref(true)
const error = ref(null)
const activeTab = ref('overall')
const totalUsers = ref(0)

// Tab configuration
const tabs = ref([
  {
    id: 'overall',
    name: 'Overall',
    icon: 'TrophyIcon'
  },
  {
    id: 'points',
    name: 'Total Points',
    icon: 'StarIcon'
  },
  {
    id: 'questions',
    name: 'Unique Questions',
    icon: 'QuestionMarkCircleIcon'
  },
  {
    id: 'accuracy',
    name: 'Accuracy Rate',
    icon: 'TargetIcon'
  }
])

// Computed properties
const user = computed(() => authStore.user)
const currentUserId = computed(() => user.value?.id)
const userRank = computed(() => {
  const userIndex = topPerformers.value.findIndex(s => s.userId === currentUserId.value)
  return userIndex !== -1 ? userIndex + 1 : 'N/A'
})

// Methods
const getRankClass = (rank) => {
  if (rank === 1) return 'bg-yellow-400 text-white'
  if (rank === 2) return 'bg-gray-300 text-white'
  if (rank === 3) return 'bg-orange-400 text-white'
  return 'bg-gray-200 text-gray-700'
}

const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// Methods
const loadLeaderboardData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Load all rankings in parallel
    const [
      overallRankings,
      totalPointsRankingsData,
      uniqueQuestionsRankingsData,
      accuracyRankingsData,
      excelRankings,
      pythonRankings,
      pandasRankings
    ] = await Promise.all([
      leaderboardService.calculateOverallRankings(),
      leaderboardService.calculateTotalPointsRankings(),
      leaderboardService.calculateUniqueQuestionsRankings(),
      leaderboardService.calculateAccuracyRankings(),
      leaderboardService.calculateCategoryRankings('Excel'),
      leaderboardService.calculateCategoryRankings('Python'),
      leaderboardService.calculateCategoryRankings('Pandas')
    ])
    
    // Set rankings data
    topPerformers.value = overallRankings.slice(0, 20)
    totalPointsRankings.value = totalPointsRankingsData
    uniqueQuestionsRankings.value = uniqueQuestionsRankingsData
    accuracyRankings.value = accuracyRankingsData
    totalUsers.value = overallRankings.length
    
    // Load category rankings
    categoryLeaders.value = {
      excel: excelRankings,
      python: pythonRankings,
      pandas: pandasRankings
    }
    
    // Mock achievements for now (will be implemented later)
    recentAchievements.value = [
      { id: 1, name: 'Perfect Score', icon: '🏆', student: 'Recent Achiever', date: new Date() },
      { id: 2, name: 'Streak Master', icon: '🔥', student: 'Active Learner', date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { id: 3, name: 'Speed Demon', icon: '⚡', student: 'Quick Thinker', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: 4, name: 'First Quiz', icon: '🎯', student: 'New Student', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    ]
    
  } catch (err) {
    error.value = 'An error occurred while loading leaderboard data'
    console.error('Error loading leaderboard data:', err)
  } finally {
    loading.value = false
  }
}

// Watch for user changes
watch(() => user.value?.id, (newUserId) => {
  if (newUserId) {
    loadLeaderboardData()
    // Subscribe to real-time updates
    subscribeToRealtimeUpdates()
  }
})

// Subscribe to real-time updates
const subscribeToRealtimeUpdates = () => {
  realtimeService.subscribeToLeaderboardUpdates((event) => {
    console.log('Leaderboard real-time update received:', event)
    // Refresh leaderboard data when new submission is added
    loadLeaderboardData()
  })
}

// Load data on mount
onMounted(() => {
  if (user.value?.id) {
    loadLeaderboardData()
    subscribeToRealtimeUpdates()
  }
})

// Cleanup subscriptions on unmount
onUnmounted(() => {
  realtimeService.unsubscribeFromLeaderboardUpdates()
})
</script>
