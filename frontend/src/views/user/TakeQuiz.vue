<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Quiz Header -->
    <QuizHeader
      :quiz="quiz"
      :current-question-index="currentQuestionIndex"
      :total-questions="questions.length"
      :time-remaining="timeRemaining"
      :progress-percentage="progressPercentage"
      @flag-question="flagQuestion"
    />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Pre-Quiz Screen -->
      <div v-if="!quizStarted" class="bg-white rounded-lg shadow-sm border p-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ quiz?.title }}</h1>
        
        <div v-if="quiz?.description" class="text-gray-600 mb-6 max-w-2xl mx-auto">
          {{ quiz.description }}
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ questions.length }}</div>
            <div class="text-sm text-gray-500">Questions</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ quiz?.duration_minutes }}</div>
            <div class="text-sm text-gray-500">Minutes</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ quiz?.category }}</div>
            <div class="text-sm text-gray-500">Category</div>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <h3 class="text-lg font-semibold text-blue-900 mb-3">Quiz Instructions</h3>
          <ul class="text-left text-blue-800 space-y-2">
            <li class="flex items-start">
              <span class="text-blue-600 mr-2">•</span>
              Read each question carefully before answering
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 mr-2">•</span>
              You can navigate between questions using the navigation panel
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 mr-2">•</span>
              Flag questions for review if you want to come back later
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 mr-2">•</span>
              Your answers are automatically saved every 30 seconds
            </li>
            <li class="flex items-start">
              <span class="text-blue-600 mr-2">•</span>
              The quiz will auto-submit when time expires
            </li>
          </ul>
        </div>
        
        <div class="flex items-center justify-center mb-6">
          <input
            id="terms"
            v-model="termsAccepted"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="terms" class="ml-2 text-sm text-gray-700">
            I understand the quiz rules and agree to complete this quiz honestly
          </label>
        </div>
        
        <button
          type="button"
          :disabled="!termsAccepted"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          @click="startQuiz"
        >
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Quiz
        </button>
      </div>

      <!-- Quiz Interface -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Main Question Area -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-lg shadow-sm border">
            <!-- Error State -->
            <div v-if="questions.length === 0" class="p-8 text-center">
              <div class="text-red-600 mb-4">
                <svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No Questions Available</h3>
              <p class="text-gray-600 mb-4">This quiz doesn't have any questions assigned to it.</p>
              <button
                @click="$router.push('/dashboard')"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
            
            <!-- Question Display -->
            <QuestionDisplay
              v-else
              :question="currentQuestion"
              :question-number="currentQuestionIndex + 1"
              :total-questions="questions.length"
              :user-answer="userAnswers[currentQuestion?.id]"
              @answer-selected="saveAnswer"
            />
            
            <!-- Quiz Controls -->
            <QuizControls
              :can-go-previous="currentQuestionIndex > 0"
              :can-go-next="currentQuestionIndex < questions.length - 1"
              :is-last-question="currentQuestionIndex === questions.length - 1"
              :answered-count="answeredCount"
              :flagged-count="flaggedQuestions.size"
              @previous-question="previousQuestion"
              @next-question="nextQuestion"
              @submit-quiz="showReviewScreen"
            />
          </div>
        </div>

        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <QuestionNavigation
            :questions="questions"
            :current-index="currentQuestionIndex"
            :user-answers="userAnswers"
            :flagged-questions="flaggedQuestions"
            @question-selected="goToQuestion"
            @review-flagged="reviewFlaggedQuestions"
          />
        </div>
      </div>
    </div>

    <!-- Review Screen Modal -->
    <ReviewScreen
      v-if="showReview"
      :quiz="quiz"
      :questions="questions"
      :user-answers="userAnswers"
      :flagged-questions="flaggedQuestions"
      :time-taken="timeTaken"
      @submit-quiz="submitQuiz"
      @close="showReview = false"
    />

    <!-- Network Status -->
    <NetworkStatus :is-online="isOnline" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '../../stores/quiz'
import QuizHeader from '../../components/user/QuizHeader.vue'
import QuestionDisplay from '../../components/user/QuestionDisplay.vue'
import QuestionNavigation from '../../components/user/QuestionNavigation.vue'
import QuizControls from '../../components/user/QuizControls.vue'
import ReviewScreen from '../../components/user/ReviewScreen.vue'
import NetworkStatus from '../../components/user/NetworkStatus.vue'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()

// Quiz state
const quiz = ref(null)
const questions = ref([])
const currentQuestionIndex = ref(0)
const userAnswers = ref({})
const flaggedQuestions = ref(new Set())
const quizStarted = ref(false)
const showReview = ref(false)
const isOnline = ref(navigator.onLine)
const termsAccepted = ref(false)

// Timer state
const timeRemaining = ref(0)
const timeTaken = ref(0)
const timerInterval = ref(null)
const quizStartTime = ref(null)

// Computed properties
const currentQuestion = computed(() => {
  const question = questions.value[currentQuestionIndex.value]
  console.log('🔍 TakeQuiz: currentQuestion computed:', {
    index: currentQuestionIndex.value,
    question: question,
    questionsLength: questions.value.length
  })
  return question
})

const progressPercentage = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100)
})

const answeredCount = computed(() => {
  return Object.keys(userAnswers.value).length
})

// Methods
const startQuiz = async () => {
  try {
    console.log('🔍 TakeQuiz: startQuiz called');
    console.log('🔍 TakeQuiz: Current state before start:');
    console.log('  - quiz.value:', quiz.value);
    console.log('  - questions.value:', questions.value);
    console.log('  - questions.value.length:', questions.value?.length);
    console.log('  - quizStarted.value:', quizStarted.value);
    
    quizStartTime.value = new Date()
    quizStarted.value = true
    
    console.log('🔍 TakeQuiz: After setting quizStarted = true');
    
    // Start timer
    startTimer()
    
    // Auto-save answers every 30 seconds
    startAutoSave()
    
    // Load quiz data if not already loaded
    if (!quiz.value || questions.value.length === 0) {
      console.log('🔍 TakeQuiz: Loading quiz data...');
      await loadQuizData()
    } else {
      console.log('🔍 TakeQuiz: Quiz data already loaded, skipping loadQuizData');
    }
    
    // Restore previous progress if exists
    restoreProgress()
    
    console.log('🔍 TakeQuiz: startQuiz completed');
    console.log('🔍 TakeQuiz: Final state:');
    console.log('  - quiz.value:', quiz.value);
    console.log('  - questions.value:', questions.value);
    console.log('  - questions.value.length:', questions.value?.length);
    console.log('  - currentQuestion.value:', currentQuestion.value);
    
  } catch (error) {
    console.error('Error starting quiz:', error)
    // Handle error - show notification, etc.
  }
}

const loadQuizData = async () => {
  const quizId = route.params.id
  
  try {
    console.log('🔍 TakeQuiz: Loading quiz data for ID:', quizId);
    
    // Validate quiz ID
    if (!quizId) {
      throw new Error('Quiz ID is required')
    }
    
    // Load quiz and questions
    const [quizData, questionsData] = await Promise.all([
      quizStore.getQuizById(quizId),
      quizStore.getQuizQuestions(quizId)
    ])
    
    console.log('🔍 TakeQuiz: Quiz data loaded:', quizData);
    console.log('🔍 TakeQuiz: Questions data loaded:', questionsData);
    console.log('🔍 TakeQuiz: Questions array length:', questionsData?.length);
    
    // Validate quiz data
    if (!quizData) {
      throw new Error('Quiz not found')
    }
    
    // Debug: Check first question structure
    if (questionsData && questionsData.length > 0) {
      console.log('🔍 TakeQuiz: First question structure:', {
        id: questionsData[0].id,
        questions: questionsData[0].questions,
        question: questionsData[0].question,
        question_type: questionsData[0].question_type,
        answers: questionsData[0].answers,
        level: questionsData[0].level,
        fullObject: questionsData[0]
      })
      
      // Validate question structure
      const firstQuestion = questionsData[0]
      if (!firstQuestion.questions && !firstQuestion.question) {
        console.warn('⚠️ TakeQuiz: Question missing text field:', firstQuestion)
      }
      if (!firstQuestion.answers || !Array.isArray(firstQuestion.answers)) {
        console.warn('⚠️ TakeQuiz: Question missing or invalid answers:', firstQuestion)
      }
    } else {
      console.warn('⚠️ TakeQuiz: No questions found for quiz:', quizId)
    }
    
    quiz.value = quizData
    questions.value = questionsData || []
    timeRemaining.value = quizData.duration_minutes * 60 // Convert to seconds
    
    console.log('🔍 TakeQuiz: After setting values:');
    console.log('  - quiz.value:', quiz.value);
    console.log('  - questions.value:', questions.value);
    console.log('  - questions.value.length:', questions.value?.length);
    console.log('  - currentQuestion.value:', currentQuestion.value);
    
  } catch (error) {
    console.error('Error loading quiz data:', error)
    // Set error state
    quiz.value = null
    questions.value = []
    throw error
  }
}

const startTimer = () => {
  timerInterval.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      timeTaken.value++
      
      // Auto-submit when time expires
      if (timeRemaining.value === 0) {
        autoSubmitQuiz()
      }
    }
  }, 1000)
}

const startAutoSave = () => {
  setInterval(() => {
    saveProgress()
  }, 30000) // Every 30 seconds
}

const saveAnswer = (questionId, answer) => {
  userAnswers.value[questionId] = answer
  saveProgress()
}

const flagQuestion = (questionId) => {
  if (flaggedQuestions.value.has(questionId)) {
    flaggedQuestions.value.delete(questionId)
  } else {
    flaggedQuestions.value.add(questionId)
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const goToQuestion = (index) => {
  if (index >= 0 && index < questions.value.length) {
    currentQuestionIndex.value = index
  }
}

const reviewFlaggedQuestions = () => {
  const flaggedIndices = questions.value
    .map((q, index) => flaggedQuestions.value.has(q.id) ? index : -1)
    .filter(index => index !== -1)
  
  if (flaggedIndices.length > 0) {
    currentQuestionIndex.value = flaggedIndices[0]
  }
}

const showReviewScreen = () => {
  showReview.value = true
}

const submitQuiz = async () => {
  try {
    // Calculate score
    const score = calculateScore()
    
    // ✅ FIX: Extract quiz ID and pass individual parameters
    const quizId = quiz.value?.id
    if (!quizId) {
      throw new Error('Quiz ID is required for submission')
    }
    
    console.log('📝 Pre-submission validation:', {
      'quiz.value.id': quizId,
      'quiz.value type': typeof quiz.value,
      'total_questions': questions.value?.length,
      'user_answers_count': Object.keys(userAnswers.value).length
    })
    
    // Submit to backend with correct parameters
    const submission = await quizStore.submitQuiz(
      quizId,                    // quizId: string
      userAnswers.value,         // answers: object
      timeTaken.value            // timeTaken: number
    )
    
    // Clear progress
    clearProgress()
    
    // Redirect to results
    router.push(`/results/${submission.id}`)
    
  } catch (error) {
    console.error('Error submitting quiz:', error)
    // Handle error - show notification, etc.
  }
}

const autoSubmitQuiz = () => {
  // Stop timer
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  // Auto-submit
  submitQuiz()
}

const calculateScore = () => {
  let correctAnswers = 0
  
  questions.value.forEach(question => {
    const userAnswer = userAnswers.value[question.id]
    if (userAnswer && isAnswerCorrect(question, userAnswer)) {
      correctAnswers++
    }
  })
  
  return Math.round((correctAnswers / questions.value.length) * 100)
}

const isAnswerCorrect = (question, userAnswer) => {
  if (question.question_type === 'Multiple Choice') {
    // For multiple choice, check if all correct answers are selected
    const correctAnswers = question.correct_answers || []
    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    
    return correctAnswers.length === userAnswers.length &&
           correctAnswers.every(correct => userAnswers.includes(correct))
  } else {
    // For single choice and yes/no
    return userAnswer === question.correct_answers?.[0]
  }
}

const saveProgress = () => {
  const progress = {
    quizId: quiz.value?.id,
    currentQuestionIndex: currentQuestionIndex.value,
    userAnswers: userAnswers.value,
    flaggedQuestions: Array.from(flaggedQuestions.value),
    timeRemaining: timeRemaining.value,
    timeTaken: timeTaken.value,
    timestamp: new Date().toISOString()
  }
  
  localStorage.setItem(`quiz_progress_${quiz.value?.id}`, JSON.stringify(progress))
}

const restoreProgress = () => {
  if (!quiz.value?.id) return
  
  const savedProgress = localStorage.getItem(`quiz_progress_${quiz.value.id}`)
  if (savedProgress) {
    try {
      const progress = JSON.parse(savedProgress)
      
      // Check if progress is recent (within last hour)
      const progressTime = new Date(progress.timestamp)
      const now = new Date()
      const timeDiff = now - progressTime
      
      if (timeDiff < 60 * 60 * 1000) { // 1 hour
        currentQuestionIndex.value = progress.currentQuestionIndex || 0
        userAnswers.value = progress.userAnswers || {}
        flaggedQuestions.value = new Set(progress.flaggedQuestions || [])
        timeRemaining.value = progress.timeRemaining || 0
        timeTaken.value = progress.timeTaken || 0
      }
    } catch (error) {
      console.error('Error restoring progress:', error)
    }
  }
}

const clearProgress = () => {
  if (quiz.value?.id) {
    localStorage.removeItem(`quiz_progress_${quiz.value.id}`)
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await loadQuizData()
  } catch (error) {
    console.error('Error loading quiz:', error)
    // Handle error - redirect to dashboard, show error message, etc.
    // You could add a toast notification here or redirect to dashboard
    // For now, we'll just log the error and let the UI show the error state
  }
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})

// Network status monitoring
const updateNetworkStatus = () => {
  isOnline.value = navigator.onLine
}

window.addEventListener('online', updateNetworkStatus)
window.addEventListener('offline', updateNetworkStatus)

// Auto-save on page unload
window.addEventListener('beforeunload', () => {
  if (quizStarted.value) {
    saveProgress()
  }
})
</script>
