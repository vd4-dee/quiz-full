<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Results Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
        <p class="text-gray-600">{{ quiz?.title }}</p>
      </div>

      <!-- Score Display -->
      <ResultsDisplay
        :score="submission?.score || submission?.submission_data?.score || 0"
        :total-questions="questions.length"
        :time-taken="submission?.time_taken || 0"
        :quiz-duration="quiz?.duration_minutes || 0"
      />

      <!-- Performance Breakdown -->
      <div class="mt-8">
        <PerformanceBreakdown
          :questions="questions"
          :user-answers="submission?.submission_data?.answers || {}"
          :correct-answers="correctAnswers"
        />
      </div>

      <!-- Question Review -->
      <div class="mt-8">
        <QuestionReview
          :questions="questions"
          :user-answers="submission?.submission_data?.answers || {}"
          :correct-answers="correctAnswers"
        />
      </div>

      <!-- Action Buttons -->
      <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          type="button"
          class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          @click="goToDashboard"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Dashboard
        </button>

        <button
          v-if="canRetake"
          type="button"
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          @click="retakeQuiz"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retake Quiz
        </button>

        <button
          type="button"
          class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          @click="shareResults"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          Share Results
        </button>

        <button
          type="button"
          class="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          @click="printResults"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Results
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '../../stores/quiz'
import ResultsDisplay from '../../components/user/ResultsDisplay.vue'
import PerformanceBreakdown from '../../components/user/PerformanceBreakdown.vue'
import QuestionReview from '../../components/user/QuestionReview.vue'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()

// Reactive data
const submission = ref(null)
const quiz = ref(null)
const questions = ref([])
const loading = ref(true)

// Computed properties
const correctAnswers = computed(() => {
  const answers = {}
  questions.value.forEach(question => {
    answers[question.id] = question.correct_answers
  })
  return answers
})

const canRetake = computed(() => {
  // Check if quiz allows retakes (this would be a quiz setting)
  return quiz.value?.allow_retakes !== false
})

// Methods
const goToDashboard = () => {
  router.push('/dashboard')
}

const retakeQuiz = () => {
  router.push(`/quiz/${quiz.value.id}`)
}

const shareResults = () => {
  // Generate shareable link or copy to clipboard
  const shareData = {
    title: `Quiz Results: ${quiz.value?.title}`,
    text: `I scored ${submission.value?.score}% on ${quiz.value?.title}!`,
    url: window.location.href
  }
  
  if (navigator.share) {
    navigator.share(shareData)
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
    // Show toast notification
    alert('Results link copied to clipboard!')
  }
}

const printResults = () => {
  window.print()
}

// Load data on mount
onMounted(async () => {
  try {
    const submissionId = route.params.id
    console.log('🔍 Loading results for submission ID:', submissionId)
    
    // Load submission data
    const submissionData = await quizStore.getSubmissionById(submissionId)
    submission.value = submissionData
    
    // ✅ ADD VALIDATION: Check if submission has quiz_id
    if (!submissionData.quiz || submissionData.quiz.trim() === '') {
      console.error('❌ Submission missing quiz_id:', submissionData)
      throw new Error('Invalid submission: missing quiz_id')
    }
    
    console.log('📝 Submission data loaded:', {
      id: submissionData.id,
      quiz_id: submissionData.quiz,
      user_id: submissionData.user,
      score: submissionData.score
    })
    
    // Load quiz and questions
    console.log('🔍 Loading quiz by ID:', submissionData.quiz)
    console.log('🔍 Loading quiz questions for quiz ID:', submissionData.quiz)
    
    const [quizData, questionsData] = await Promise.all([
      quizStore.getQuizById(submissionData.quiz),
      quizStore.getQuizQuestions(submissionData.quiz)
    ])
    
    quiz.value = quizData
    questions.value = questionsData
    
    console.log('✅ Results loaded successfully:', {
      quiz: quizData?.title,
      questionsCount: questionsData?.length,
      submissionScore: submissionData.score,
      submissionDataScore: submissionData.submission_data?.score,
      finalScore: submissionData.score || submissionData.submission_data?.score || 0
    })
    
  } catch (error) {
    console.error('❌ Error loading results:', error)
    // Handle error - redirect to dashboard, show error message, etc.
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
})
</script>
