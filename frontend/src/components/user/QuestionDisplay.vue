<template>
  <div class="p-6">
    <!-- Debug Information (temporary) -->
    <div v-if="showDebug" class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 class="text-sm font-semibold text-yellow-800 mb-2">🐛 Debug Information</h3>
      <div class="text-xs text-yellow-700 space-y-1">
        <div><strong>Question Object:</strong> {{ JSON.stringify(question, null, 2) }}</div>
        <div><strong>Question Text (questions):</strong> "{{ question?.questions }}"</div>
        <div><strong>Question Text (question):</strong> "{{ question?.question }}"</div>
        <div><strong>Question ID:</strong> {{ question?.id }}</div>
        <div><strong>Question Type:</strong> {{ question?.question_type }}</div>
        <div><strong>Answers Array:</strong> {{ JSON.stringify(question?.answers) }}</div>
      </div>
      <button 
        @click="showDebug = false" 
        class="mt-2 text-xs text-yellow-600 hover:text-yellow-800"
      >
        Hide Debug
      </button>
    </div>

    <!-- Question Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-500">
          Question {{ questionNumber }} of {{ totalQuestions }}
        </span>
        <div class="flex items-center space-x-2">
          <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {{ question?.level }}
          </span>
          <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
            {{ question?.question_type }}
          </span>
          <!-- Debug Toggle Button -->
          <button 
            @click="showDebug = !showDebug" 
            class="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
            title="Toggle Debug Info"
          >
            🐛
          </button>
        </div>
      </div>
      
      <!-- Question Text - Try both field names -->
      <h2 class="text-xl font-semibold text-gray-900 leading-relaxed">
        {{ question?.questions || question?.question || 'No question text available' }}
      </h2>
      
      <!-- Error State -->
      <div v-if="!question?.questions && !question?.question" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">
          ⚠️ Question text is missing. Please check the data structure.
        </p>
      </div>
    </div>

    <!-- Answer Options -->
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="!question" class="flex items-center justify-center p-8">
        <div class="text-gray-500">Loading question...</div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="!question.answers || !Array.isArray(question.answers) || question.answers.length === 0" class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">
          ⚠️ No answer options available for this question.
        </p>
      </div>
      
      <!-- Single Choice -->
      <div v-else-if="question?.question_type === 'Single Choice'" class="space-y-3">
        <label
          v-for="(answer, index) in question?.answers"
          :key="index"
          class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          :class="{
            'border-blue-500 bg-blue-50': userAnswer === index,
            'border-gray-200': userAnswer !== index
          }"
        >
          <input
            type="radio"
            :name="`question-${question.id}`"
            :value="index"
            :checked="userAnswer === index"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            @change="$emit('answer-selected', question.id, index)"
          />
          <span class="ml-3 text-gray-900">{{ answer || `Answer ${index + 1}` }}</span>
        </label>
      </div>

      <!-- Multiple Choice -->
      <div v-else-if="question?.question_type === 'Multiple Choice'" class="space-y-3">
        <label
          v-for="(answer, index) in question?.answers"
          :key="index"
          class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          :class="{
            'border-blue-500 bg-blue-50': isAnswerSelected(index),
            'border-gray-200': !isAnswerSelected(index)
          }"
        >
          <input
            type="checkbox"
            :value="index"
            :checked="isAnswerSelected(index)"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            @change="toggleAnswer(index)"
          />
          <span class="ml-3 text-gray-900">{{ answer || `Answer ${index + 1}` }}</span>
        </label>
      </div>

      <!-- Yes/No -->
      <div v-else-if="question?.question_type === 'Yes/No'" class="grid grid-cols-2 gap-4">
        <button
          type="button"
          class="p-6 border-2 rounded-lg text-center transition-all duration-200 font-medium text-lg"
          :class="{
            'border-blue-500 bg-blue-50 text-blue-700': userAnswer === 0,
            'border-gray-200 hover:border-gray-300 text-gray-700': userAnswer !== 0
          }"
          @click="$emit('answer-selected', question.id, 0)"
        >
          <div class="text-3xl mb-2">✅</div>
          Yes
        </button>
        
        <button
          type="button"
          class="p-6 border-2 rounded-lg text-center transition-all duration-200 font-medium text-lg"
          :class="{
            'border-blue-500 bg-blue-50 text-blue-700': userAnswer === 1,
            'border-gray-200 hover:border-gray-300 text-gray-700': userAnswer !== 1
          }"
          @click="$emit('answer-selected', question.id, 1)"
        >
          <div class="text-3xl mb-2">❌</div>
          No
        </button>
      </div>
      
      <!-- Unknown Question Type -->
      <div v-else class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-sm text-yellow-600">
          ⚠️ Unknown question type: "{{ question?.question_type }}". Please contact support.
        </p>
      </div>
    </div>

    <!-- Clear Selection Button -->
    <div v-if="userAnswer !== null && userAnswer !== undefined" class="mt-6">
      <button
        type="button"
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        @click="clearSelection"
      >
        <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Clear Selection
      </button>
    </div>

    <!-- Question Info -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span>Category: {{ question?.category }}</span>
        <span v-if="question?.sub_category">Sub-category: {{ question?.sub_category }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

// Props
const props = defineProps({
  question: {
    type: Object,
    default: null
  },
  questionNumber: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  userAnswer: {
    type: [Number, Array],
    default: null
  }
})

// Emits
const emit = defineEmits(['answer-selected'])

// Debug state
const showDebug = ref(false)

// Debug logging
watch(() => props.question, (newQuestion) => {
  console.log('🔍 QuestionDisplay: Question prop changed:', newQuestion)
  if (newQuestion) {
    console.log('🔍 QuestionDisplay: Question details:', {
      id: newQuestion.id,
      questions: newQuestion.questions,
      question: newQuestion.question,
      question_type: newQuestion.question_type,
      answers: newQuestion.answers,
      level: newQuestion.level
    })
  }
}, { immediate: true })

// Computed properties
const isAnswerSelected = (index) => {
  if (Array.isArray(props.userAnswer)) {
    return props.userAnswer.includes(index)
  }
  return props.userAnswer === index
}

// Methods
const toggleAnswer = (index) => {
  if (!Array.isArray(props.userAnswer)) {
    props.userAnswer = []
  }
  
  const newAnswers = [...(props.userAnswer || [])]
  const answerIndex = newAnswers.indexOf(index)
  
  if (answerIndex > -1) {
    newAnswers.splice(answerIndex, 1)
  } else {
    newAnswers.push(index)
  }
  
  emit('answer-selected', props.question.id, newAnswers)
}

const clearSelection = () => {
  emit('answer-selected', props.question.id, null)
}
</script>
