<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ isEditing ? 'Edit Quiz' : 'Create New Quiz' }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Step {{ currentStep }} of {{ totalSteps }}: {{ getStepTitle(currentStep) }}
          </p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
               :style="{ width: `${(currentStep / totalSteps) * 100}%` }"></div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="p-6">
        <!-- Step 1: Basic Information -->
        <div v-if="currentStep === 1" class="space-y-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Basic Quiz Information</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quiz Title *</label>
              <input v-model="quizData.title" type="text" class="w-full px-3 py-2 border rounded-md" required />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quiz Type *</label>
              <select v-model="quizData.type" class="w-full px-3 py-2 border rounded-md" required>
                <option value="">Select type</option>
                <option value="static">Static Quiz</option>
                <option value="dynamic">Dynamic Quiz</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea v-model="quizData.description" rows="3" class="w-full px-3 py-2 border rounded-md"></textarea>
          </div>
        </div>

        <!-- Step 2: Question Selection -->
        <div v-if="currentStep === 2" class="space-y-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Question Selection</h3>
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Question Bank -->
            <div class="lg:col-span-2">
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 class="font-medium mb-4">Question Bank</h4>
                
                <div class="space-y-2 max-h-96 overflow-y-auto">
                  <div v-for="question in availableQuestions" :key="question.id"
                       class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                    <div class="flex-1">
                      <p class="text-sm font-medium truncate">{{ question.question }}</p>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">{{ question.type }}</span>
                        <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">{{ question.level }}</span>
                      </div>
                    </div>
                    
                    <button @click="addQuestionToQuiz(question)"
                            :disabled="isQuestionInQuiz(question.id)"
                            class="ml-3 px-3 py-1 text-sm border rounded-md">
                      {{ isQuestionInQuiz(question.id) ? 'Added' : 'Add' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Selected Questions -->
            <div>
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 class="font-medium mb-4">Selected Questions ({{ selectedQuestions.length }})</h4>
                
                <div class="space-y-2">
                  <div v-for="(question, index) in selectedQuestions" :key="question.id"
                       class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm truncate">{{ question.question }}</p>
                      <p class="text-xs text-gray-500">{{ question.points }} pts</p>
                    </div>
                    
                    <button @click="removeQuestionFromQuiz(index)" class="p-1 text-red-400 hover:text-red-600">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Quiz Settings -->
        <div v-if="currentStep === 3" class="space-y-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Quiz Settings</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Limit (minutes)</label>
              <input v-model="quizData.timeLimit" type="number" min="5" max="180" class="w-full px-3 py-2 border rounded-md" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Passing Score (%)</label>
              <input v-model="quizData.passingScore" type="number" min="0" max="100" class="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
        </div>

        <!-- Step 4: Review -->
        <div v-if="currentStep === 4" class="space-y-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Review & Save</h3>
          
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="font-medium mb-4">Quiz Summary</h4>
            
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Title:</span>
                <span class="text-sm font-medium">{{ quizData.title }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Questions:</span>
                <span class="text-sm font-medium">{{ selectedQuestions.length }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">Total Points:</span>
                <span class="text-sm font-medium">{{ totalPoints }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <button v-if="currentStep > 1" @click="previousStep"
                class="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
          Previous
        </button>
        <div v-else></div>
        
        <div class="flex space-x-3">
          <button @click="$emit('close')"
                  class="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
            Cancel
          </button>
          
          <button v-if="currentStep < totalSteps" @click="nextStep"
                  :disabled="!canProceedToNextStep"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            Next
          </button>
          
          <button v-else @click="saveQuiz"
                  :disabled="!canSaveQuiz"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
            {{ isSubmitting ? 'Saving...' : 'Save Quiz' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { pb } from '../../../services/pocketbase'

const props = defineProps({
  quiz: { type: Object, default: null },
  isEditing: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

// Constants
const totalSteps = 4

// State
const currentStep = ref(1)
const isSubmitting = ref(false)
const availableQuestions = ref([])
const selectedQuestions = ref([])

// Quiz data
const quizData = reactive({
  title: '',
  type: '',
  description: '',
  timeLimit: null,
  passingScore: 70
})

// Computed
const totalPoints = computed(() => {
  return selectedQuestions.value.reduce((sum, q) => sum + q.points, 0)
})

const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 1: return quizData.title && quizData.type
    case 2: return selectedQuestions.value.length > 0
    case 3: return true
    default: return true
  }
})

const canSaveQuiz = computed(() => {
  return selectedQuestions.value.length > 0 && !isSubmitting.value
})

// Methods
const getStepTitle = (step) => {
  const titles = { 1: 'Basic Information', 2: 'Question Selection', 3: 'Quiz Settings', 4: 'Review & Save' }
  return titles[step] || ''
}

const nextStep = () => {
  if (currentStep.value < totalSteps && canProceedToNextStep.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const addQuestionToQuiz = (question) => {
  if (!isQuestionInQuiz(question.id)) {
    selectedQuestions.value.push(question)
  }
}

const removeQuestionFromQuiz = (index) => {
  selectedQuestions.value.splice(index, 1)
}

const isQuestionInQuiz = (questionId) => {
  return selectedQuestions.value.some(q => q.id === questionId)
}

const saveQuiz = async () => {
  if (!canSaveQuiz.value) return
  
  isSubmitting.value = true
  
  try {
    const quizToSave = {
      ...quizData,
      questions: selectedQuestions.value.map(q => q.id),
      totalPoints: totalPoints.value,
      questionCount: selectedQuestions.value.length
    }
    
    await emit('save', quizToSave)
    emit('close')
  } catch (error) {
    console.error('Error saving quiz:', error)
  } finally {
    isSubmitting.value = false
  }
}

const loadQuestions = async () => {
  try {
    const records = await pb.collection('questions').getList(1, 1000, { sort: '-created' })
    availableQuestions.value = records.items
  } catch (error) {
    console.error('Error loading questions:', error)
  }
}

// Initialize
onMounted(() => {
  loadQuestions()
  
  if (props.quiz) {
    Object.assign(quizData, props.quiz)
  }
})
</script>
