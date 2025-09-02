<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Question Review</h3>
    
    <div class="space-y-6">
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        class="border border-gray-200 rounded-lg p-4"
        :class="getQuestionBorderClass(question.id)"
      >
        <!-- Question Header -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-500">Question {{ index + 1 }}</span>
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              :class="getQuestionTypeClasses(question.question_type)"
            >
              {{ question.question_type }}
            </span>
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              :class="getDifficultyClasses(question.level)"
            >
              {{ question.level }}
            </span>
          </div>
          
          <!-- Result Indicator -->
          <div class="flex items-center space-x-2">
            <div
              class="w-3 h-3 rounded-full"
              :class="getResultColor(question.id)"
            ></div>
            <span class="text-sm font-medium" :class="getResultTextColor(question.id)">
              {{ getResultText(question.id) }}
            </span>
          </div>
        </div>

        <!-- Question Text -->
        <div class="mb-4">
          <h4 class="text-base font-medium text-gray-900 leading-relaxed">
            {{ question.question }}
          </h4>
        </div>

        <!-- Answer Options -->
        <div class="mb-4">
          <div class="space-y-2">
            <div
              v-for="(answer, answerIndex) in question.answers"
              :key="answerIndex"
              class="flex items-center p-3 rounded-lg border-2 transition-colors duration-200"
              :class="getAnswerOptionClasses(question.id, answerIndex)"
            >
              <div class="flex items-center space-x-3">
                <!-- Answer Type Icon -->
                <div class="flex-shrink-0">
                  <div
                    v-if="question.question_type === 'Single Choice'"
                    class="w-4 h-4 rounded-full border-2"
                    :class="getRadioClasses(question.id, answerIndex)"
                  ></div>
                  <div
                    v-else-if="question.question_type === 'Multiple Choice'"
                    class="w-4 h-4 rounded border-2"
                    :class="getCheckboxClasses(question.id, answerIndex)"
                  ></div>
                  <div
                    v-else
                    class="w-4 h-4 rounded border-2"
                    :class="getYesNoClasses(question.id, answerIndex)"
                  ></div>
                </div>
                
                <!-- Answer Text -->
                <span class="text-sm text-gray-900">{{ answer }}</span>
                
                <!-- Status Icons -->
                <div class="flex items-center space-x-1">
                  <svg
                    v-if="isCorrectAnswer(question, answerIndex)"
                    class="w-4 h-4 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  
                  <svg
                    v-if="isUserAnswer(question.id, answerIndex) && !isCorrectAnswer(question, answerIndex)"
                    class="w-4 h-4 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Explanation -->
        <div v-if="question.explanation" class="mb-4">
          <div class="bg-blue-50 rounded-lg p-3">
            <div class="flex items-start space-x-2">
              <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div class="text-sm font-medium text-blue-900 mb-1">Explanation</div>
                <div class="text-sm text-blue-800" v-html="question.explanation"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Summary -->
        <div class="flex items-center justify-between text-sm text-gray-500">
          <span>Category: {{ question.category }}</span>
          <span v-if="question.sub_category">Sub-category: {{ question.sub_category }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  userAnswers: {
    type: Object,
    default: () => ({})
  },
  correctAnswers: {
    type: Object,
    default: () => ({})
  }
})

// Computed properties
const isAnswerCorrect = (questionId) => {
  const question = props.questions.find(q => q.id === questionId)
  if (!question) return false
  
  const userAnswer = props.userAnswers[questionId]
  if (!userAnswer) return false
  
  if (question.question_type === 'Multiple Choice') {
    const correctAnswers = question.correct_answers || []
    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    
    return correctAnswers.length === userAnswers.length &&
           correctAnswers.every(correct => userAnswers.includes(correct))
  } else {
    return userAnswer === question.correct_answers?.[0]
  }
}

const isCorrectAnswer = (question, answerIndex) => {
  return question.correct_answers?.includes(answerIndex)
}

const isUserAnswer = (questionId, answerIndex) => {
  const userAnswer = props.userAnswers[questionId]
  if (Array.isArray(userAnswer)) {
    return userAnswer.includes(answerIndex)
  }
  return userAnswer === answerIndex
}

// Methods
const getQuestionBorderClass = (questionId) => {
  if (!props.userAnswers[questionId]) return 'border-gray-200'
  return isAnswerCorrect(questionId) ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
}

const getQuestionTypeClasses = (questionType) => {
  const classMap = {
    'Single Choice': 'bg-blue-100 text-blue-800',
    'Multiple Choice': 'bg-purple-100 text-purple-800',
    'Yes/No': 'bg-green-100 text-green-800'
  }
  return classMap[questionType] || 'bg-gray-100 text-gray-800'
}

const getDifficultyClasses = (level) => {
  const classMap = {
    'Easy': 'bg-green-100 text-green-800',
    'Normal': 'bg-blue-100 text-blue-800',
    'Hard': 'bg-yellow-100 text-yellow-800',
    'Very Hard': 'bg-red-100 text-red-800'
  }
  return classMap[level] || 'bg-gray-100 text-gray-800'
}

const getResultColor = (questionId) => {
  if (!props.userAnswers[questionId]) return 'bg-gray-400'
  return isAnswerCorrect(questionId) ? 'bg-green-500' : 'bg-red-500'
}

const getResultTextColor = (questionId) => {
  if (!props.userAnswers[questionId]) return 'text-gray-500'
  return isAnswerCorrect(questionId) ? 'text-green-700' : 'text-red-700'
}

const getResultText = (questionId) => {
  if (!props.userAnswers[questionId]) return 'Unanswered'
  return isAnswerCorrect(questionId) ? 'Correct' : 'Incorrect'
}

const getAnswerOptionClasses = (questionId, answerIndex) => {
  const question = props.questions.find(q => q.id === questionId)
  if (!question) return 'border-gray-200'
  
  const isCorrect = isCorrectAnswer(question, answerIndex)
  const isUserSelected = isUserAnswer(questionId, answerIndex)
  
  if (isCorrect && isUserSelected) {
    return 'border-green-500 bg-green-50'
  } else if (isCorrect && !isUserSelected) {
    return 'border-green-500 bg-green-50'
  } else if (!isCorrect && isUserSelected) {
    return 'border-red-500 bg-red-50'
  } else {
    return 'border-gray-200'
  }
}

const getRadioClasses = (questionId, answerIndex) => {
  const isSelected = isUserAnswer(questionId, answerIndex)
  const isCorrect = isCorrectAnswer(
    props.questions.find(q => q.id === questionId),
    answerIndex
  )
  
  if (isSelected && isCorrect) {
    return 'border-green-500 bg-green-500'
  } else if (isSelected && !isCorrect) {
    return 'border-red-500 bg-red-500'
  } else if (isCorrect) {
    return 'border-green-500 bg-green-500'
  } else {
    return 'border-gray-300'
  }
}

const getCheckboxClasses = (questionId, answerIndex) => {
  const isSelected = isUserAnswer(questionId, answerIndex)
  const isCorrect = isCorrectAnswer(
    props.questions.find(q => q.id === questionId),
    answerIndex
  )
  
  if (isSelected && isCorrect) {
    return 'border-green-500 bg-green-500'
  } else if (isSelected && !isCorrect) {
    return 'border-red-500 bg-red-500'
  } else if (isCorrect) {
    return 'border-green-500 bg-green-500'
  } else {
    return 'border-gray-300'
  }
}

const getYesNoClasses = (questionId, answerIndex) => {
  const isSelected = isUserAnswer(questionId, answerIndex)
  const isCorrect = isCorrectAnswer(
    props.questions.find(q => q.id === questionId),
    answerIndex
  )
  
  if (isSelected && isCorrect) {
    return 'border-green-500 bg-green-500'
  } else if (isSelected && !isCorrect) {
    return 'border-red-500 bg-red-500'
  } else if (isCorrect) {
    return 'border-green-500 bg-green-500'
  } else {
    return 'border-gray-300'
  }
}
</script>
