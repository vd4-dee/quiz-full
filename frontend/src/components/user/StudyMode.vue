<template>
  <div class="study-mode-container">
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
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Study mode loading failed</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="loadStudySession" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Main study interface -->
    <div v-else-if="currentQuiz" class="main-interface">
      <!-- Study header -->
      <div class="study-header bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Study Mode
              </span>
              <span class="text-sm text-gray-500">No time pressure • No scoring</span>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ currentQuiz.title }}</h1>
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span>Question {{ currentQuestionIndex + 1 }} of {{ currentQuiz.questions.length }}</span>
              <span>•</span>
              <span>{{ currentQuiz.difficulty }} level</span>
              <span>•</span>
              <span>{{ currentQuiz.category }}</span>
            </div>
          </div>
          
          <!-- Study controls -->
          <div class="flex items-center gap-3">
            <button
              @click="toggleExplanationMode"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                explanationMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ explanationMode ? 'Hide Explanations' : 'Show Explanations' }}
            </button>
            
            <button
              @click="showProgressModal = true"
              class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Study Progress
            </button>
          </div>
        </div>
      </div>

      <!-- Main content area -->
      <div class="flex gap-6">
        <!-- Question navigator sidebar -->
        <div class="w-80 flex-shrink-0">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Study Navigator</h3>
            
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
                <span class="text-gray-600">Not studied</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-blue-200 rounded"></div>
                <span class="text-gray-600">Studied</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-200 rounded"></div>
                <span class="text-gray-600">Current</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-yellow-200 rounded"></div>
                <span class="text-gray-600">Bookmarked</span>
              </div>
            </div>

            <!-- Study tools -->
            <div class="mt-6 space-y-3">
              <button
                @click="toggleBookmark(currentQuestionIndex)"
                :class="[
                  'w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isBookmarked(currentQuestionIndex)
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ isBookmarked(currentQuestionIndex) ? 'Remove Bookmark' : 'Bookmark Question' }}
              </button>
              
              <button
                @click="addToNotes"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add to Notes
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
                
                <!-- Study progress indicator -->
                <div class="text-sm text-gray-500">
                  {{ Math.round((studiedQuestions.size / currentQuiz.questions.length) * 100) }}% studied
                </div>
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
            <div class="answer-options space-y-3 mb-8">
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
                    @change="handleAnswerSelection"
                  />
                  <div class="flex-1">
                    <span class="text-gray-900">{{ option }}</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Explanation section -->
            <div v-if="explanationMode && userAnswers[currentQuestionIndex] !== undefined" class="explanation-section mb-8">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 class="text-lg font-medium text-blue-900 mb-4 flex items-center gap-2">
                  <span class="text-blue-600">💡</span>
                  Explanation
                </h3>
                
                <!-- Correct answer indicator -->
                <div class="mb-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-sm font-medium text-blue-900">Correct Answer:</span>
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      {{ currentQuestion.options[currentQuestion.correctAnswer] }}
                    </span>
                  </div>
                  
                  <!-- User answer feedback -->
                  <div v-if="userAnswers[currentQuestionIndex] !== currentQuestion.correctAnswer" class="text-sm text-red-700">
                    <span class="font-medium">Your answer:</span> 
                    {{ currentQuestion.options[userAnswers[currentQuestionIndex]] }}
                  </div>
                </div>
                
                <!-- Detailed explanation -->
                <div class="text-blue-900">
                  <p class="mb-3">{{ currentQuestion.explanation || 'This is the correct answer because it best matches the question requirements.' }}</p>
                  
                  <!-- Learning tips -->
                  <div v-if="currentQuestion.learningTips" class="mt-4 p-3 bg-blue-100 rounded-lg">
                    <h4 class="font-medium mb-2">💡 Learning Tip:</h4>
                    <p class="text-sm">{{ currentQuestion.learningTips }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation buttons -->
            <div class="navigation-buttons flex justify-between pt-6 border-t border-gray-200">
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
                {{ currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish Study Session' : 'Next →' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Study Progress Modal -->
    <div
      v-if="showProgressModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click="showProgressModal = false"
    >
      <div
        class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">Study Progress</h2>
            <button
              @click="showProgressModal = false"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-6">
            <!-- Progress overview -->
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-4 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ studiedQuestions.size }}</div>
                <div class="text-sm text-blue-600">Questions Studied</div>
              </div>
              <div class="text-center p-4 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ correctAnswersCount }}</div>
                <div class="text-sm text-green-600">Correct Answers</div>
              </div>
              <div class="text-center p-4 bg-purple-50 rounded-lg">
                <div class="text-2xl font-bold text-purple-600">{{ bookmarkedQuestions.size }}</div>
                <div class="text-sm text-purple-600">Bookmarked</div>
              </div>
            </div>

            <!-- Question-by-question progress -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-3">Question Progress</h3>
              <div class="space-y-2">
                <div
                  v-for="(question, index) in currentQuiz.questions"
                  :key="index"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-medium text-gray-700">Q{{ index + 1 }}</span>
                    <span class="text-sm text-gray-600">{{ question.text.substring(0, 50) }}...</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      v-if="userAnswers[index] !== undefined"
                      :class="[
                        'px-2 py-1 text-xs font-medium rounded-full',
                        userAnswers[index] === question.correctAnswer
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ userAnswers[index] === question.correctAnswer ? 'Correct' : 'Incorrect' }}
                    </span>
                    <span
                      v-else
                      class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                    >
                      Not answered
                    </span>
                    
                    <button
                      v-if="bookmarkedQuestions.has(index)"
                      class="text-yellow-500"
                      title="Bookmarked"
                    >
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import { useUserStore } from '@/stores/user'

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
const bookmarkedQuestions = ref(new Set())
const explanationMode = ref(true)
const showProgressModal = ref(false)

// Computed properties
const currentQuestion = computed(() => {
  if (!currentQuiz.value?.questions) return null
  return currentQuiz.value.questions[currentQuestionIndex.value]
})

const studiedQuestions = computed(() => {
  return new Set(Object.keys(userAnswers.value).map(Number))
})

const correctAnswersCount = computed(() => {
  let count = 0
  Object.keys(userAnswers.value).forEach(questionIndex => {
    const answer = userAnswers.value[questionIndex]
    const correctAnswer = currentQuiz.value.questions[questionIndex].correctAnswer
    if (answer === correctAnswer) count++
  })
  return count
})

// Methods
const loadStudySession = async () => {
  try {
    loading.value = true
    error.value = null
    
    const quizId = route.params.id
    // Mock quiz data - replace with actual API call
    currentQuiz.value = {
      id: quizId,
      title: 'JavaScript Fundamentals - Study Mode',
      difficulty: 'intermediate',
      category: 'Technology',
      questions: [
        {
          id: '1',
          text: 'What is the difference between let, const, and var in JavaScript?',
          options: [
            'There is no difference, they are all the same',
            'let and const are block-scoped, var is function-scoped',
            'var is the newest syntax, let and const are deprecated',
            'They have different performance characteristics only'
          ],
          correctAnswer: 1,
          explanation: 'let and const are block-scoped variables introduced in ES6, while var is function-scoped. This means let and const are only accessible within the block they are declared in, while var is accessible throughout the entire function.',
          learningTips: 'Remember: let allows reassignment, const does not. Use const by default, let when you need to reassign, and avoid var in modern JavaScript.'
        },
        {
          id: '2',
          text: 'What is the output of: console.log(typeof null)?',
          options: ['null', 'undefined', 'object', 'number'],
          correctAnswer: 2,
          explanation: 'typeof null returns "object" in JavaScript. This is a known bug in the language that has persisted for historical reasons. null is actually a primitive value, not an object.',
          learningTips: 'This is a common JavaScript gotcha! Always use === null to check for null values, not typeof.'
        },
        {
          id: '3',
          text: 'What is closure in JavaScript?',
          options: [
            'A way to close browser tabs',
            'A function that has access to variables in its outer scope',
            'A method to close database connections',
            'A technique to close event listeners'
          ],
          correctAnswer: 1,
          explanation: 'A closure is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned. This allows for data privacy and function factories.',
          learningTips: 'Closures are powerful for creating private variables and maintaining state in JavaScript. They are fundamental to many design patterns.'
        }
      ]
    }
    
    // Load user progress if exists
    loadUserProgress()
    
  } catch (err) {
    error.value = err.message || 'Failed to load study session'
  } finally {
    loading.value = false
  }
}

const loadUserProgress = () => {
  // Load saved answers and progress from store
  const savedProgress = quizStore.getQuizProgress(currentQuiz.value.id)
  if (savedProgress) {
    userAnswers.value = { ...savedProgress.answers }
    bookmarkedQuestions.value = new Set(savedProgress.bookmarked || [])
  }
}

const handleAnswerSelection = () => {
  // Mark question as studied
  saveProgress()
}

const toggleExplanationMode = () => {
  explanationMode.value = !explanationMode.value
}

const toggleBookmark = (questionIndex) => {
  if (bookmarkedQuestions.value.has(questionIndex)) {
    bookmarkedQuestions.value.delete(questionIndex)
  } else {
    bookmarkedQuestions.value.add(questionIndex)
  }
  saveProgress()
}

const isBookmarked = (questionIndex) => {
  return bookmarkedQuestions.value.has(questionIndex)
}

const addToNotes = () => {
  // Implementation for adding question to personal notes
  console.log('Adding question to notes:', currentQuestion.value.text)
}

const goToQuestion = (index) => {
  currentQuestionIndex.value = index
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < currentQuiz.value.questions.length - 1) {
    currentQuestionIndex.value++
  } else {
    // End of study session
    showProgressModal.value = true
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
    return ' (Studied)'
  }
  return ''
}

const saveProgress = () => {
  // Save current progress to store
  quizStore.saveQuizProgress(currentQuiz.value.id, {
    answers: { ...userAnswers.value },
    bookmarked: Array.from(bookmarkedQuestions.value),
    lastSaved: new Date().toISOString(),
    mode: 'study'
  })
}

// Lifecycle
onMounted(() => {
  loadStudySession()
})

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadStudySession()
  }
})
</script>

<style scoped>
.study-mode-container {
  @apply min-h-screen bg-gray-50 py-8;
}

.loading-container,
.error-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.main-interface {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.study-header {
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

.explanation-section {
  @apply animate-fade-in;
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

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
