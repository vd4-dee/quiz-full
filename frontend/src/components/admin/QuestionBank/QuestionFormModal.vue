<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ isEditing ? 'Edit Question' : 'Create New Question' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Question Type Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Type *
            </label>
            <select
              v-model="formData.type"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select type</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="short_answer">Short Answer</option>
              <option value="essay">Essay</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty Level *
            </label>
            <select
              v-model="formData.level"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select level</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <!-- Category Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            v-model="formData.category"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">Select category</option>
            <option value="mathematics">Mathematics</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="literature">Literature</option>
            <option value="geography">Geography</option>
            <option value="computer_science">Computer Science</option>
          </select>
        </div>

        <!-- Question Text -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Text *
          </label>
          <div class="border border-gray-300 dark:border-gray-600 rounded-md">
            <div class="border-b border-gray-300 dark:border-gray-600 p-2 bg-gray-50 dark:bg-gray-700">
              <button
                type="button"
                @click="toggleBold"
                class="px-2 py-1 mr-1 text-sm border rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                :class="{ 'bg-blue-500 text-white': isBold }"
              >
                B
              </button>
              <button
                type="button"
                @click="toggleItalic"
                class="px-2 py-1 mr-1 text-sm border rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                :class="{ 'bg-blue-500 text-white': isItalic }"
              >
                I
              </button>
              <button
                type="button"
                @click="insertMath"
                class="px-2 py-1 mr-1 text-sm border rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                ∑
              </button>
            </div>
            <textarea
              v-model="formData.question"
              class="w-full p-3 border-0 focus:outline-none focus:ring-0 resize-none dark:bg-gray-700 dark:text-white"
              rows="4"
              placeholder="Enter your question here..."
              required
            ></textarea>
          </div>
        </div>

        <!-- Answer Options (for multiple choice) -->
        <div v-if="formData.type === 'multiple_choice'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Answer Options *
          </label>
          <div class="space-y-3">
            <div
              v-for="(option, index) in formData.options"
              :key="index"
              class="flex items-center space-x-3"
            >
              <input
                type="radio"
                :name="'correct_answer'"
                :value="index"
                v-model="formData.correctAnswer"
                class="text-blue-600 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                v-model="formData.options[index]"
                :placeholder="`Option ${index + 1}`"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <button
                type="button"
                @click="removeOption(index)"
                class="text-red-500 hover:text-red-700 p-1"
                v-if="formData.options.length > 2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              @click="addOption"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Option
            </button>
          </div>
        </div>

        <!-- True/False Options -->
        <div v-if="formData.type === 'true_false'">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Correct Answer *
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                type="radio"
                name="correct_answer"
                value="true"
                v-model="formData.correctAnswer"
                class="text-blue-600 focus:ring-blue-500 mr-2"
                required
              />
              True
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                name="correct_answer"
                value="false"
                v-model="formData.correctAnswer"
                class="text-blue-600 focus:ring-blue-500 mr-2"
                required
              />
              False
            </label>
          </div>
        </div>

        <!-- Points -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Points *
          </label>
          <input
            type="number"
            v-model="formData.points"
            min="1"
            max="100"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <!-- Explanation -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Explanation
          </label>
          <textarea
            v-model="formData.explanation"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            rows="3"
            placeholder="Explain why this answer is correct..."
          ></textarea>
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in formData.tags"
              :key="tag"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeTag(tag)"
                class="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
            <input
              v-if="showTagInput"
              v-model="newTag"
              @keyup.enter="addTag"
              @blur="addTag"
              class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Add tag..."
            />
            <button
              v-else
              type="button"
              @click="showTagInput = true"
              class="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add Tag
            </button>
          </div>
        </div>

        <!-- Preview Toggle -->
        <div class="flex items-center justify-between">
          <button
            type="button"
            @click="togglePreview"
            class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
          </button>
        </div>

        <!-- Preview -->
        <div v-if="showPreview" class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
          <h3 class="font-medium text-gray-900 dark:text-white mb-3">Question Preview</h3>
          <div class="prose dark:prose-invert max-w-none">
            <p class="font-medium mb-4">{{ formData.question }}</p>
            
            <div v-if="formData.type === 'multiple_choice'" class="space-y-2">
              <div
                v-for="(option, index) in formData.options"
                :key="index"
                class="flex items-center space-x-2"
              >
                <input type="radio" :name="'preview_answer'" :value="index" disabled />
                <span>{{ option }}</span>
              </div>
            </div>

            <div v-if="formData.type === 'true_false'" class="space-y-2">
              <label class="flex items-center">
                <input type="radio" name="preview_answer" value="true" disabled />
                <span class="ml-2">True</span>
              </label>
              <label class="flex items-center">
                <input type="radio" name="preview_answer" value="false" disabled />
                <span class="ml-2">False</span>
              </label>
            </div>

            <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Points:</strong> {{ formData.points }}</p>
              <p><strong>Category:</strong> {{ formData.category }}</p>
              <p><strong>Level:</strong> {{ formData.level }}</p>
              <p v-if="formData.tags.length > 0"><strong>Tags:</strong> {{ formData.tags.join(', ') }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : (isEditing ? 'Update Question' : 'Create Question') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

// Form data
const formData = reactive({
  type: '',
  level: '',
  category: '',
  question: '',
  options: ['', ''],
  correctAnswer: null,
  points: 1,
  explanation: '',
  tags: []
})

// UI state
const isSubmitting = ref(false)
const showPreview = ref(false)
const showTagInput = ref(false)
const newTag = ref('')
const isBold = ref(false)
const isItalic = ref(false)

// Initialize form with existing question data
watch(() => props.question, (newQuestion) => {
  if (newQuestion) {
    Object.assign(formData, {
      type: newQuestion.type || '',
      level: newQuestion.level || '',
      category: newQuestion.category || '',
      question: newQuestion.question || '',
      options: newQuestion.options || ['', ''],
      correctAnswer: newQuestion.correctAnswer || null,
      points: newQuestion.points || 1,
      explanation: newQuestion.explanation || '',
      tags: newQuestion.tags || []
    })
  }
}, { immediate: true })

// Methods
const addOption = () => {
  formData.options.push('')
}

const removeOption = (index) => {
  formData.options.splice(index, 1)
  if (formData.correctAnswer === index) {
    formData.correctAnswer = null
  } else if (formData.correctAnswer > index) {
    formData.correctAnswer--
  }
}

const addTag = () => {
  if (newTag.value.trim() && !formData.tags.includes(newTag.value.trim())) {
    formData.tags.push(newTag.value.trim())
  }
  newTag.value = ''
  showTagInput.value = false
}

const removeTag = (tag) => {
  const index = formData.tags.indexOf(tag)
  if (index > -1) {
    formData.tags.splice(index, 1)
  }
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const toggleBold = () => {
  isBold.value = !isBold.value
  // Simple text formatting - in production, use a proper rich text editor
}

const toggleItalic = () => {
  isItalic.value = !isItalic.value
  // Simple text formatting - in production, use a proper rich text editor
}

const insertMath = () => {
  // Placeholder for math formula insertion
  formData.question += ' ∑ '
}

const validateForm = () => {
  if (!formData.type || !formData.level || !formData.category || !formData.question || !formData.points) {
    return false
  }
  
  if (formData.type === 'multiple_choice') {
    if (formData.options.length < 2 || formData.correctAnswer === null) {
      return false
    }
    if (formData.options.some(option => !option.trim())) {
      return false
    }
  }
  
  if (formData.type === 'true_false' && formData.correctAnswer === null) {
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) {
    alert('Please fill in all required fields correctly.')
    return
  }
  
  isSubmitting.value = true
  
  try {
    const questionData = { ...formData }
    
    // Clean up options for non-multiple choice questions
    if (formData.type !== 'multiple_choice') {
      questionData.options = []
    }
    
    await emit('save', questionData)
    emit('close')
  } catch (error) {
    console.error('Error saving question:', error)
    alert('Error saving question. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.prose {
  max-width: none;
}
</style>
