<template>
  <div class="quiz-browser-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-200 rounded w-1/4"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="text-center py-12">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="fetchQuizzes" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div v-else class="main-content">
      <!-- Header with search and filters -->
      <div class="browser-header mb-6">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Discover Quizzes</h1>
            <p class="text-gray-600">Find the perfect quiz to challenge yourself</p>
          </div>
          
          <!-- Search bar -->
          <div class="relative w-full lg:w-96">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search quizzes..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Quick filters -->
        <div class="flex flex-wrap gap-2 mt-4">
          <button
            v-for="filter in quickFilters"
            :key="filter.value"
            @click="toggleQuickFilter(filter.value)"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeQuickFilters.includes(filter.value)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Filter sidebar and quiz grid -->
      <div class="flex gap-6">
        <!-- Filter sidebar -->
        <div class="w-64 flex-shrink-0">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            
            <!-- Difficulty filter -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-700 mb-3">Difficulty</h4>
              <div class="space-y-2">
                <label v-for="level in difficultyLevels" :key="level.value" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="level.value"
                    v-model="selectedDifficulties"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ level.label }}</span>
                </label>
              </div>
            </div>

            <!-- Category filter -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-700 mb-3">Category</h4>
              <div class="space-y-2">
                <label v-for="category in categories" :key="category.value" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="category.value"
                    v-model="selectedCategories"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ category.label }}</span>
                </label>
              </div>
            </div>

            <!-- Duration filter -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-700 mb-3">Duration</h4>
              <div class="space-y-2">
                <label v-for="duration in durationRanges" :key="duration.value" class="flex items-center">
                  <input
                    type="checkbox"
                    :value="duration.value"
                    v-model="selectedDurations"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ duration.label }}</span>
                </label>
              </div>
            </div>

            <!-- Clear filters -->
            <button
              @click="clearFilters"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <!-- Quiz grid -->
        <div class="flex-1">
          <!-- Sort options -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">{{ filteredQuizzes.length }} quizzes found</span>
            </div>
            
            <div class="flex items-center gap-2">
              <label class="text-sm text-gray-600">Sort by:</label>
              <select
                v-model="sortBy"
                class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="popularity">Popularity</option>
                <option value="difficulty">Difficulty</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>

          <!-- Quiz cards grid -->
          <div v-if="filteredQuizzes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="quiz in filteredQuizzes"
              :key="quiz.id"
              class="quiz-card bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              @click="previewQuiz(quiz)"
            >
              <div class="p-6">
                <!-- Quiz header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{{ quiz.title }}</h3>
                    <p class="text-sm text-gray-600 line-clamp-2">{{ quiz.description }}</p>
                  </div>
                  <QuizStatusBadge :status="getQuizStatus(quiz)" />
                </div>

                <!-- Quiz metadata -->
                <div class="space-y-3 mb-4">
                  <div class="flex items-center gap-2">
                    <DifficultyBadge :difficulty="quiz.difficulty" />
                    <span class="text-sm text-gray-500">•</span>
                    <span class="text-sm text-gray-500">{{ quiz.duration }} min</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm text-gray-500">{{ quiz.questionCount }} questions</span>
                  </div>

                  <div v-if="quiz.category" class="flex items-center gap-2">
                    <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span class="text-sm text-gray-500">{{ quiz.category }}</span>
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="flex gap-2">
                  <button
                    @click.stop="startQuiz(quiz)"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Start Quiz
                  </button>
                  <button
                    @click.stop="previewQuiz(quiz)"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-12">
            <div class="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
            <p class="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <button
              @click="clearFilters"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Preview Modal -->
    <div
      v-if="previewModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="closePreviewModal"
    >
      <div
        class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">{{ selectedQuiz?.title }}</h2>
            <button
              @click="closePreviewModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="selectedQuiz" class="space-y-4">
            <p class="text-gray-600">{{ selectedQuiz.description }}</p>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-3 rounded-lg">
                <span class="text-sm font-medium text-gray-700">Difficulty</span>
                <div class="mt-1">
                  <DifficultyBadge :difficulty="selectedQuiz.difficulty" />
                </div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <span class="text-sm font-medium text-gray-700">Duration</span>
                <div class="mt-1 text-lg font-semibold text-gray-900">{{ selectedQuiz.duration }} min</div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <span class="text-sm font-medium text-gray-700">Questions</span>
                <div class="mt-1 text-lg font-semibold text-gray-900">{{ selectedQuiz.questionCount }}</div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <span class="text-sm font-medium text-gray-700">Category</span>
                <div class="mt-1 text-lg font-semibold text-gray-900">{{ selectedQuiz.category || 'General' }}</div>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="startQuiz(selectedQuiz)"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Quiz
              </button>
              <button
                @click="closePreviewModal"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useQuizStore } from '@/stores/quiz'
import QuizStatusBadge from './QuizStatusBadge.vue'
import DifficultyBadge from './DifficultyBadge.vue'

// Router and stores
const router = useRouter()
const userStore = useUserStore()
const quizStore = useQuizStore()

// Reactive state
const loading = ref(false)
const error = ref(null)
const quizzes = ref([])
const searchQuery = ref('')
const selectedDifficulties = ref([])
const selectedCategories = ref([])
const selectedDurations = ref([])
const sortBy = ref('newest')
const previewModalOpen = ref(false)
const selectedQuiz = ref(null)

// Quick filters
const quickFilters = [
  { label: 'Not Started', value: 'not_started' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Recommended', value: 'recommended' }
]
const activeQuickFilters = ref([])

// Filter options
const difficultyLevels = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' }
]

const categories = [
  { label: 'Mathematics', value: 'mathematics' },
  { label: 'Science', value: 'science' },
  { label: 'History', value: 'history' },
  { label: 'Literature', value: 'literature' },
  { label: 'Technology', value: 'technology' }
]

const durationRanges = [
  { label: 'Quick (< 15 min)', value: 'quick' },
  { label: 'Standard (15-30 min)', value: 'standard' },
  { label: 'Extended (30+ min)', value: 'extended' }
]

// Computed properties
const filteredQuizzes = computed(() => {
  let filtered = [...quizzes.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(quiz => 
      quiz.title.toLowerCase().includes(query) ||
      quiz.description.toLowerCase().includes(query) ||
      (quiz.category && quiz.category.toLowerCase().includes(query))
    )
  }

  // Apply difficulty filter
  if (selectedDifficulties.value.length > 0) {
    filtered = filtered.filter(quiz => 
      selectedDifficulties.value.includes(quiz.difficulty)
    )
  }

  // Apply category filter
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(quiz => 
      selectedCategories.value.includes(quiz.category)
    )
  }

  // Apply duration filter
  if (selectedDurations.value.length > 0) {
    filtered = filtered.filter(quiz => {
      const duration = quiz.duration
      return selectedDurations.value.some(range => {
        if (range === 'quick') return duration < 15
        if (range === 'standard') return duration >= 15 && duration <= 30
        if (range === 'extended') return duration > 30
        return false
      })
    })
  }

  // Apply quick filters
  if (activeQuickFilters.value.includes('not_started')) {
    filtered = filtered.filter(quiz => getQuizStatus(quiz) === 'not_started')
  }
  if (activeQuickFilters.value.includes('in_progress')) {
    filtered = filtered.filter(quiz => getQuizStatus(quiz) === 'in_progress')
  }
  if (activeQuickFilters.value.includes('completed')) {
    filtered = filtered.filter(quiz => getQuizStatus(quiz) === 'completed')
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.created) - new Date(a.created)
      case 'popularity':
        return (b.attempts || 0) - (a.attempts || 0)
      case 'difficulty':
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      case 'duration':
        return a.duration - b.duration
      default:
        return 0
    }
  })

  return filtered
})

// Methods
const fetchQuizzes = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Mock data for now - replace with actual API call
    const mockQuizzes = [
      {
        id: '1',
        title: 'JavaScript Fundamentals',
        description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow.',
        difficulty: 'beginner',
        duration: 20,
        questionCount: 15,
        category: 'Technology',
        created: '2024-01-15',
        attempts: 45
      },
      {
        id: '2',
        title: 'Advanced Mathematics',
        description: 'Challenge yourself with complex mathematical concepts and problem-solving.',
        difficulty: 'advanced',
        duration: 45,
        questionCount: 25,
        category: 'Mathematics',
        created: '2024-01-10',
        attempts: 23
      },
      {
        id: '3',
        title: 'World History',
        description: 'Explore major historical events and their impact on modern society.',
        difficulty: 'intermediate',
        duration: 30,
        questionCount: 20,
        category: 'History',
        created: '2024-01-20',
        attempts: 67
      }
    ]
    
    quizzes.value = mockQuizzes
  } catch (err) {
    error.value = err.message || 'Failed to fetch quizzes'
  } finally {
    loading.value = false
  }
}

const getQuizStatus = (quiz) => {
  // Mock status logic - replace with actual user progress data
  const userProgress = userStore.userProgress?.[quiz.id]
  if (userProgress?.completed) return 'completed'
  if (userProgress?.started) return 'in_progress'
  return 'not_started'
}

const toggleQuickFilter = (filter) => {
  const index = activeQuickFilters.value.indexOf(filter)
  if (index > -1) {
    activeQuickFilters.value.splice(index, 1)
  } else {
    activeQuickFilters.value.push(filter)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedDifficulties.value = []
  selectedCategories.value = []
  selectedDurations.value = []
  activeQuickFilters.value = []
}

const debouncedSearch = () => {
  // Simple debouncing - could be enhanced with proper debounce utility
  clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => {
    // Search is reactive, no additional action needed
  }, 300)
}

const previewQuiz = (quiz) => {
  selectedQuiz.value = quiz
  previewModalOpen.value = true
}

const closePreviewModal = () => {
  previewModalOpen.value = false
  selectedQuiz.value = null
}

const startQuiz = (quiz) => {
  closePreviewModal()
  router.push(`/user/take-quiz/${quiz.id}`)
}

// Search debouncing
const searchTimeout = ref(null)

// Lifecycle
onMounted(() => {
  fetchQuizzes()
})

// Watch for filter changes to trigger search
watch([selectedDifficulties, selectedCategories, selectedDurations, activeQuickFilters], () => {
  // Filters are reactive, no additional action needed
})
</script>

<style scoped>
.quiz-browser-container {
  @apply min-h-screen bg-gray-50 py-8;
}

.loading-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.error-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.main-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.browser-header {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 p-6;
}

.quiz-card {
  @apply transform hover:scale-105;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .quiz-browser-container .flex {
    @apply flex-col;
  }
  
  .quiz-browser-container .w-64 {
    @apply w-full;
  }
}
</style>
