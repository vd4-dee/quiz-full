<template>
  <div class="quiz-session-container">
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
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Quiz loading failed</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="loadQuiz" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Main quiz interface -->
    <div v-else-if="currentQuiz" class="main-interface">
      <!-- Quiz header with timer and progress -->
      <div class="quiz-header bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ currentQuiz.title }}</h1>
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span>Question {{ currentQuestionIndex + 1 }} of {{ currentQuiz.questions.length }}</span>
              <span>•</span>
              <span>{{ currentQuiz.difficulty }} level</span>
            </div>
          </div>
          
          <!-- Timer widget -->
          <div class="flex items-center gap-4">
            <TimerWidget 
              :time-remaining="timeRemaining" 
              :total-time="currentQuiz.duration * 60"
              @time-up="handleTimeUp"
            />
            
            <!-- Progress indicator -->
            <div class="flex items-center gap-2">
              <div class="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${progressPercentage}%` }"
                ></div>
              </div>
              <span class="text-sm text-gray-600">{{ Math.round(progressPercentage) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content area -->
      <div class="flex gap-6">
        <!-- Question navigator sidebar -->
        <div class="w-80 flex-shrink-0">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Question Navigator</h3>
            
            <!-- Question grid -->
            <div class="grid grid-cols-5 gap-2 mb-4">
              <button
                v-for="(question, index) in currentQuiz.questions"
                :key="index"
                @click="goToQuestion(index)"
                :class="[
                  'w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center',
                  getQuestionButtonClasses(index)
                ]"
                :title="`Question ${index + 1}${getQuestionStatus(index)}`"
              >
                {{ index + 1 }}
              </button>
            </div>

            <!-- Question status legend -->
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-gray-200 rounded"></div>
                <span class="text-gray-600">Not answered</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-blue-200 rounded"></div>
                <span class="text-gray-600">Answered</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-yellow-200 rounded"></div>
                <span class="text-gray-600">Bookmarked</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-200 rounded"></div>
                <span class="text-gray-600">Current</span>
              </div>
            </div>

            <!-- Quiz controls -->
            <div class="mt-6 space-y-3">
              <button
                @click="toggleReviewMode"
                :class="[
                  'w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  reviewMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ reviewMode ? 'Exit Review' : 'Review Mode' }}
              </button>
              
              <button
                @click="showSubmissionModal = true"
                class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>

        <!-- Question display area -->
        <div class="flex-1">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <!-- Question content -->
            <div class="question-content mb-8">
              <div class="flex items-start justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-900">
                  Question {{ currentQuestionIndex + 1 }}
                </h2>
                
                <!-- Bookmark button -->
                <button
                  @click="toggleBookmark(currentQuestionIndex)"
                  :class="[
                    'p-2 rounded-lg transition-colors',
                    isBookmarked(currentQuestionIndex)
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-400 hover:text-gray-600'
                  ]"
                  :title="isBookmarked(currentQuestionIndex) ? 'Remove bookmark' : 'Bookmark question'"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path v-if="isBookmarked(currentQuestionIndex)" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    <path v-else d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" fill="none" stroke="currentColor" stroke-width="2" />
                  </svg>
                </button>
              </div>

              <div class="prose max-w-none">
                <p class="text-lg text-gray-700 leading-relaxed">
                  {{ currentQuestion.text }}
                </p>
                
                <!-- Question image if exists -->
                <img 
                  v-if="currentQuestion.image" 
                  :src="currentQuestion.image" 
                  :alt="currentQuestion.text"
                  class="mt-4 max-w-full h-auto rounded-lg"
                />
              </div>
            </div>

            <!-- Answer options -->
            <div class="answer-options space-y-3">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Select your answer:</h3>
              
              <div
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                class="answer-option"
              >
                <label class="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    :name="`question-${currentQuestionIndex}`"
                    :value="index"
                    v-model="userAnswers[currentQuestionIndex]"
                    class="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    @change="saveAnswer"
                  />
                  <div class="flex-1">
                    <span class="text-gray-900">{{ option }}</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Confidence selector -->
            <div class="confidence-selector mt-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4">How confident are you in your answer?</h3>
              <div class="flex gap-2">
                <button
                  v-for="level in confidenceLevels"
                  :key="level.value"
                  @click="setConfidence(level.value)"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    userConfidence[currentQuestionIndex] === level.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ level.label }}
                </button>
              </div>
            </div>

            <!-- Navigation buttons -->
            <div class="navigation-buttons flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0"
                :class="[
                  'px-6 py-2 rounded-lg font-medium transition-colors',
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                ← Previous
              </button>
              
              <button
                @click="nextQuestion"
                :class="[
                  'px-6 py-2 rounded-lg font-medium transition-colors',
                  currentQuestionIndex === currentQuiz.questions.length - 1
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                ]"
              >
                {{ currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next →' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submission confirmation modal -->
    <div
      v-if="showSubmissionModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showSubmissionModal = false"
    >
      <div
        class="bg-white rounded-lg max-w-md w-full p-6"
        @click.stop
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Submit Quiz?</h3>
        <p class="text-gray-600 mb-6">
          You have answered {{ answeredQuestionsCount }} out of {{ currentQuiz.questions.length }} questions.
          Are you sure you want to submit?
        </p>
        
        <div class="flex gap-3">
          <button
            @click="showSubmissionModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Continue Quiz
          </button>
          <button
            @click="submitQuiz"
            class="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import { useUserStore } from '@/stores/user'
import TimerWidget from './TimerWidget.vue'

// Router and stores
const router = useRouter()
const route = useRoute()
const quizStore = useQuizStore()
const userStore = useUserStore()

// Reactive state
const loading = ref(false)
const error = ref(null)
const currentQuiz = ref(null)
const currentQuestionIndex = ref(0)
const userAnswers = ref({})
const userConfidence = ref({})
const bookmarkedQuestions = ref(new Set())
const reviewMode = ref(false)
const showSubmissionModal = ref(false)
const timeRemaining = ref(0)
const autoSaveInterval = ref(null)

// Confidence levels
const confidenceLevels = [
  { label: 'Very Low', value: 1 },
  { label: 'Low', value: 2 },
  { label: 'Medium', value: 3 },
  { label: 'High', value: 4 },
  { label: 'Very High', value: 5 }
]

// Computed properties
const currentQuestion = computed(() => {
  if (!currentQuiz.value?.questions) return null
  return currentQuiz.value.questions[currentQuestionIndex.value]
})

const progressPercentage = computed(() => {
  if (!currentQuiz.value?.questions) return 0
  return (answeredQuestionsCount.value / currentQuiz.value.questions.length) * 100
})

const answeredQuestionsCount = computed(() => {
  return Object.keys(userAnswers.value).length
})

// Methods
const loadQuiz = async () => {
  try {
    loading.value = true
    error.value = null
    
    const quizId = route.params.id
    // Mock quiz data - replace with actual API call
    currentQuiz.value = {
      id: quizId,
      title: 'Sample Quiz',
      difficulty: 'intermediate',
      duration: 30,
      questions: [
        {
          id: '1',
          text: 'What is the capital of France?',
          options: ['London', 'Berlin', 'Paris', 'Madrid'],
          correctAnswer: 2
        },
        {
          id: '2',
          text: 'Which planet is closest to the Sun?',
          options: ['Venus', 'Mercury', 'Earth', 'Mars'],
          correctAnswer: 1
        },
        {
          id: '3',
          text: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1
        }
      ]
    }
    
    // Initialize time remaining
    timeRemaining.value = currentQuiz.value.duration * 60
    
    // Load user progress if exists
    loadUserProgress()
    
    // Start auto-save
    startAutoSave()
    
  } catch (err) {
    error.value = err.message || 'Failed to load quiz'
  } finally {
    loading.value = false
  }
}

const loadUserProgress = () => {
  // Load saved answers and progress from store
  const savedProgress = quizStore.getQuizProgress(currentQuiz.value.id)
  if (savedProgress) {
    userAnswers.value = { ...savedProgress.answers }
    userConfidence.value = { ...savedProgress.confidence }
    bookmarkedQuestions.value = new Set(savedProgress.bookmarked || [])
  }
}

const saveAnswer = () => {
  // Save current answer to store
  quizStore.saveQuizProgress(currentQuiz.value.id, {
    answers: { ...userAnswers.value },
    confidence: { ...userConfidence.value },
    bookmarked: Array.from(bookmarkedQuestions.value),
    lastSaved: new Date().toISOString()
  })
}

const setConfidence = (level) => {
  userConfidence.value[currentQuestionIndex.value] = level
  saveAnswer()
}

const toggleBookmark = (questionIndex) => {
  if (bookmarkedQuestions.value.has(questionIndex)) {
    bookmarkedQuestions.value.delete(questionIndex)
  } else {
    bookmarkedQuestions.value.add(questionIndex)
  }
  saveAnswer()
}

const isBookmarked = (questionIndex) => {
  return bookmarkedQuestions.value.has(questionIndex)
}

const goToQuestion = (index) => {
  currentQuestionIndex.value = index
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < currentQuiz.value.questions.length - 1) {
    currentQuestionIndex.value++
  } else {
    showSubmissionModal.value = true
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const getQuestionButtonClasses = (index) => {
  if (index === currentQuestionIndex.value) {
    return 'bg-green-200 text-green-800 border-2 border-green-400'
  }
  
  if (bookmarkedQuestions.value.has(index)) {
    return 'bg-yellow-200 text-yellow-800'
  }
  
  if (userAnswers.value[index] !== undefined) {
    return 'bg-blue-200 text-blue-800'
  }
  
  return 'bg-gray-200 text-gray-600 hover:bg-gray-300'
}

const getQuestionStatus = (index) => {
  if (bookmarkedQuestions.value.has(index)) {
    return ' (Bookmarked)'
  }
  if (userAnswers.value[index] !== undefined) {
    return ' (Answered)'
  }
  return ''
}

const toggleReviewMode = () => {
  reviewMode.value = !reviewMode.value
}

const handleTimeUp = () => {
  // Auto-submit when time runs out
  submitQuiz()
}

const startAutoSave = () => {
  autoSaveInterval.value = setInterval(() => {
    saveAnswer()
  }, 30000) // Auto-save every 30 seconds
}

const submitQuiz = async () => {
  try {
    // Calculate score
    let correctAnswers = 0
    let totalQuestions = currentQuiz.value.questions.length
    
    Object.keys(userAnswers.value).forEach(questionIndex => {
      const answer = userAnswers.value[questionIndex]
      const correctAnswer = currentQuiz.value.questions[questionIndex].correctAnswer
      if (answer === correctAnswer) {
        correctAnswers++
      }
    })
    
    const score = (correctAnswers / totalQuestions) * 100
    
    // Save submission
    await quizStore.submitQuiz({
      quizId: currentQuiz.value.id,
      answers: userAnswers.value,
      confidence: userConfidence.value,
      score,
      timeSpent: (currentQuiz.value.duration * 60) - timeRemaining.value,
      completedAt: new Date().toISOString()
    })
    
    // Navigate to results
    router.push(`/user/quiz-results/${currentQuiz.value.id}`)
    
  } catch (err) {
    error.value = err.message || 'Failed to submit quiz'
  }
}

// Lifecycle
onMounted(() => {
  loadQuiz()
})

onUnmounted(() => {
  if (autoSaveInterval.value) {
    clearInterval(autoSaveInterval.value)
  }
})

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadQuiz()
  }
})
</script>

<style scoped>
.quiz-session-container {
  @apply min-h-screen bg-gray-50 py-8;
}

.loading-container,
.error-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.main-interface {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.quiz-header {
  @apply sticky top-0 z-10;
}

.answer-option label:hover {
  @apply border-blue-300;
}

.answer-option input:checked + div {
  @apply bg-blue-50 border-blue-300;
}

.navigation-buttons button:disabled {
  @apply cursor-not-allowed;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .main-interface .flex {
    @apply flex-col;
  }
  
  .main-interface .w-80 {
    @apply w-full;
  }
}
</style>
