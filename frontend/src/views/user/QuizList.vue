<template>
  <UserLayout>
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-green-600 to-blue-700 rounded-xl shadow-lg p-8 text-white mb-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div class="flex-1">
          <h1 class="text-3xl font-bold mb-2">My Quizzes</h1>
          <p class="text-green-100 text-lg">
            Browse and take quizzes to improve your skills
          </p>
        </div>
        <div class="mt-6 lg:mt-0">
          <div class="text-center">
            <div class="text-4xl font-bold">{{ availableQuizzes.length }}</div>
            <div class="text-green-100">Available Quizzes</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Filters -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      <div class="flex flex-wrap items-center gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select v-model="filters.category" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="All">All Categories</option>
            <option value="Excel">Excel</option>
            <option value="Python">Python</option>
            <option value="Pandas">Pandas</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select v-model="filters.difficulty" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="All">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Normal">Normal</option>
            <option value="Hard">Hard</option>
            <option value="Very Hard">Very Hard</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filters.status" class="border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input 
            v-model="filters.search"
            type="text"
            placeholder="Search quizzes..."
            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>

    <!-- Quiz Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="quiz in filteredQuizzes" 
        :key="quiz.id"
        class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow cursor-pointer"
        @click="startQuiz(quiz)"
      >
        <!-- Quiz Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ quiz.title }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ quiz.description }}</p>
          </div>
          <div class="flex-shrink-0 ml-3">
            <span :class="getDifficultyBadgeClass(quiz.level)" class="px-2 py-1 text-xs font-medium rounded-full">
              {{ quiz.level }}
            </span>
          </div>
        </div>

        <!-- Quiz Info -->
        <div class="space-y-3 mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {{ quiz.category }}
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ quiz.questions?.length || 0 }} questions
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ quiz.estimatedTime || '15' }} min
          </div>
        </div>

        <!-- Quiz Status -->
        <div class="mb-4">
          <div v-if="getQuizStatus(quiz) === 'completed'" class="flex items-center text-green-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-medium">Completed</span>
            <span class="ml-auto text-sm font-bold">{{ getQuizScore(quiz) }}%</span>
          </div>
          <div v-else-if="getQuizStatus(quiz) === 'in-progress'" class="flex items-center text-blue-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="text-sm font-medium">In Progress</span>
          </div>
          <div v-else class="flex items-center text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="text-sm font-medium">Available</span>
          </div>
        </div>

        <!-- Action Button -->
        <button 
          :class="[
            'w-full py-2 px-4 rounded-lg font-medium transition-colors',
            getQuizStatus(quiz) === 'completed' 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : getQuizStatus(quiz) === 'in-progress'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          ]"
          @click.stop="startQuiz(quiz)"
        >
          {{ getQuizStatus(quiz) === 'completed' ? 'Review Results' : getQuizStatus(quiz) === 'in-progress' ? 'Continue Quiz' : 'Start Quiz' }}
        </button>
      </div>
    </div>

    <!-- No Quizzes State -->
    <div v-if="filteredQuizzes.length === 0 && !loading" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No quizzes available</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your filters or check back later.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-500">Loading quizzes...</p>
    </div>
  </UserLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useQuizStore } from '../../stores/quiz'
import UserLayout from '../../components/user/UserLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const quizStore = useQuizStore()

// Reactive data
const loading = ref(true)
const quizzes = ref([])
const userSubmissions = ref([])

// Filters
const filters = ref({
  category: 'All',
  difficulty: 'All',
  status: 'All',
  search: ''
})

// Computed properties
const user = computed(() => authStore.user)

const availableQuizzes = computed(() => quizzes.value)

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
      const status = getQuizStatus(quiz)
      if (filters.value.status === 'Available') return status === 'available'
      if (filters.value.status === 'In Progress') return status === 'in-progress'
      if (filters.value.status === 'Completed') return status === 'completed'
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

// Methods
const getQuizStatus = (quiz) => {
  const submission = userSubmissions.value.find(s => s.quiz === quiz.id)
  if (!submission) return 'available'
  if (submission.completed_at) return 'completed'
  return 'in-progress'
}

const getQuizScore = (quiz) => {
  const submission = userSubmissions.value.find(s => s.quiz === quiz.id)
  return submission?.score || 0
}

const getDifficultyBadgeClass = (difficulty) => {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-800'
    case 'Normal': return 'bg-blue-100 text-blue-800'
    case 'Hard': return 'bg-yellow-100 text-yellow-800'
    case 'Very Hard': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const startQuiz = (quiz) => {
  router.push(`/quiz/${quiz.id}`)
}

const loadQuizzes = async () => {
  try {
    loading.value = true
    const [quizzesData, submissionsData] = await Promise.all([
      quizStore.loadAvailableQuizzes(),
      quizStore.getUserSubmissions(user.value?.id)
    ])
    quizzes.value = quizzesData
    userSubmissions.value = submissionsData
  } catch (error) {
    console.error('Error loading quizzes:', error)
  } finally {
    loading.value = false
  }
}

// Load data on mount
onMounted(() => {
  loadQuizzes()
})
</script>
