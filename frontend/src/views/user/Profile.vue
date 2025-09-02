<template>
  <UserLayout>
    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-lg text-gray-600">Loading your profile...</span>
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
          <h3 class="text-lg font-medium text-red-800">Error Loading Profile</h3>
          <p class="text-red-700">{{ error }}</p>
          <button @click="loadUserProfile" class="mt-2 text-red-600 hover:text-red-500 underline">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else>
      <!-- Hero Section -->
      <div class="bg-gradient-to-r from-green-600 to-teal-700 rounded-xl shadow-lg p-8 text-white mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div class="flex-1">
            <div class="flex items-center mb-4">
              <div class="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-6">
                <span class="text-3xl font-bold text-white">
                  {{ getUserInitials() }}
                </span>
              </div>
              <div>
                <h1 class="text-3xl font-bold mb-2">{{ userProfile.name || 'User' }}</h1>
                <p class="text-green-100 text-lg">{{ userProfile.email }}</p>
                <p class="text-green-100 text-sm">Member since {{ formatDate(userProfile.created) }}</p>
              </div>
            </div>
          </div>
          <div class="mt-6 lg:mt-0">
            <div class="text-center">
              <div class="text-4xl font-bold">{{ userStats.averageScore }}%</div>
              <div class="text-green-100">Overall Performance</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Overview -->
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
              <p class="text-2xl font-bold text-gray-900">{{ userStats.totalQuizzes }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Best Score</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.bestScore }}%</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Study Time</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.totalTime }}h</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Study Streak</p>
              <p class="text-2xl font-bold text-gray-900">{{ userStats.studyStreak }} days</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Category Performance -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Excel</span>
              <div class="flex items-center">
                <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div class="bg-blue-600 h-2 rounded-full" :style="{ width: userStats.categoryScores.excel + '%' }"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ userStats.categoryScores.excel }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Python</span>
              <div class="flex items-center">
                <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div class="bg-green-600 h-2 rounded-full" :style="{ width: userStats.categoryScores.python + '%' }"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ userStats.categoryScores.python }}%</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Pandas</span>
              <div class="flex items-center">
                <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div class="bg-purple-600 h-2 rounded-full" :style="{ width: userStats.categoryScores.pandas + '%' }"></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ userStats.categoryScores.pandas }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Username</label>
              <p class="text-sm text-gray-900">{{ userProfile.username || 'Not set' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <p class="text-sm text-gray-900">{{ userProfile.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <p class="text-sm text-gray-900 capitalize">{{ userProfile.role || 'student' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Member Since</label>
              <p class="text-sm text-gray-900">{{ formatDate(userProfile.created) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="result in recentResults" :key="result.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ result.quizName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ result.category }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getScoreClass(result.score)">{{ result.score }}%</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(result.date) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { statisticsService } from '../../services/statisticsService'
import UserLayout from '../../components/user/UserLayout.vue'

const authStore = useAuthStore()

// Reactive data
const userProfile = ref({})
const userStats = ref({
  totalQuizzes: 0,
  averageScore: 0,
  bestScore: 0,
  totalTime: 0,
  categoryScores: { excel: 0, python: 0, pandas: 0 },
  studyStreak: 0
})
const recentResults = ref([])
const loading = ref(true)
const error = ref(null)

// Computed properties
const user = computed(() => authStore.user)

// Methods
const loadUserProfile = async () => {
  if (!user.value?.id) return
  
  loading.value = true
  error.value = null
  
  try {
    // Get user profile data
    userProfile.value = user.value
    
    // Get user submissions and calculate statistics
    const submissionsResult = await statisticsService.getUserSubmissions(user.value.id)
    
    if (submissionsResult.success) {
      const submissions = submissionsResult.data
      
      // Calculate user statistics
      userStats.value = statisticsService.calculateUserStatistics(submissions)
      
      // Get recent results
      recentResults.value = statisticsService.getRecentResults(submissions, 5)
      
      // Get time analytics
      const timeAnalytics = statisticsService.getTimeAnalytics(submissions)
      userStats.value.totalTime = timeAnalytics.totalStudyTime
      
    } else {
      error.value = submissionsResult.error || 'Failed to load profile data'
    }
  } catch (err) {
    error.value = 'An error occurred while loading profile data'
    console.error('Error loading profile data:', err)
  } finally {
    loading.value = false
  }
}

const getUserInitials = () => {
  if (!userProfile.value.name) return 'U'
  return userProfile.value.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getScoreClass = (score) => {
  if (score >= 90) return 'text-green-600 font-semibold'
  if (score >= 80) return 'text-blue-600 font-semibold'
  if (score >= 70) return 'text-yellow-600 font-semibold'
  return 'text-red-600 font-semibold'
}

const formatDate = (date) => {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString()
}

// Watch for user changes
watch(() => user.value?.id, (newUserId) => {
  if (newUserId) {
    loadUserProfile()
  }
})

// Load data on mount
onMounted(() => {
  if (user.value?.id) {
    loadUserProfile()
  }
})
</script>
