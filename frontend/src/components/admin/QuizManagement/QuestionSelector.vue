<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Advanced Question Selection</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Select questions with advanced filtering and algorithm-based suggestions
      </p>
    </div>

    <!-- Selection Strategy -->
    <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <h4 class="font-medium text-gray-900 dark:text-white mb-3">Selection Strategy</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selection Method
          </label>
          <select
            v-model="selectionStrategy.method"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="manual">Manual Selection</option>
            <option value="algorithm">Algorithm-based</option>
            <option value="random">Random Selection</option>
            <option value="difficulty_based">Difficulty Distribution</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Question Count
          </label>
          <input
            v-model="selectionStrategy.targetCount"
            type="number"
            min="1"
            max="100"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="20"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total Points Target
          </label>
          <input
            v-model="selectionStrategy.targetPoints"
            type="number"
            min="1"
            max="1000"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="100"
          />
        </div>
      </div>
      
      <!-- Algorithm Options -->
      <div v-if="selectionStrategy.method === 'algorithm'" class="mt-4 p-3 bg-white dark:bg-gray-700 rounded border">
        <h5 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Algorithm Parameters</h5>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Difficulty Distribution</label>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Easy:</span>
                <input
                  v-model="selectionStrategy.algorithm.easy"
                  type="number"
                  min="0"
                  max="100"
                  class="w-20 px-2 py-1 text-sm border rounded"
                />
                <span class="text-sm text-gray-500">%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Medium:</span>
                <input
                  v-model="selectionStrategy.algorithm.medium"
                  type="number"
                  min="0"
                  max="100"
                  class="w-20 px-2 py-1 text-sm border rounded"
                />
                <span class="text-sm text-gray-500">%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600 dark:text-gray-400">Hard:</span>
                <input
                  v-model="selectionStrategy.algorithm.hard"
                  type="number"
                  min="0"
                  max="100"
                  class="w-20 px-2 py-1 text-sm border rounded"
                />
                <span class="text-sm text-gray-500">%</span>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Question Types</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="selectionStrategy.algorithm.types"
                  type="checkbox"
                  value="multiple_choice"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Multiple Choice</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="selectionStrategy.algorithm.types"
                  type="checkbox"
                  value="true_false"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">True/False</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="selectionStrategy.algorithm.types"
                  type="checkbox"
                  value="short_answer"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Short Answer</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="mt-4 flex space-x-3">
        <button
          @click="generateQuestions"
          :disabled="!canGenerateQuestions"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Questions
        </button>
        
        <button
          @click="clearSelection"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Clear Selection
        </button>
      </div>
    </div>

    <!-- Question Bank with Advanced Filters -->
    <div class="mb-6">
      <h4 class="font-medium text-gray-900 dark:text-white mb-4">Question Bank</h4>
      
      <!-- Advanced Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <select
            v-model="filters.category"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="mathematics">Mathematics</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="literature">Literature</option>
            <option value="geography">Geography</option>
            <option value="computer_science">Computer Science</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
          <select
            v-model="filters.level"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
          <select
            v-model="filters.type"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
            <option value="short_answer">Short Answer</option>
            <option value="essay">Essay</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search questions..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      
      <!-- Points Range Filter -->
      <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Points Range</label>
        <div class="flex items-center space-x-3">
          <input
            v-model="filters.minPoints"
            type="number"
            placeholder="Min"
            class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <span class="text-gray-500 dark:text-gray-400">to</span>
          <input
            v-model="filters.maxPoints"
            type="number"
            placeholder="Max"
            class="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            @click="clearFilters"
            class="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Question List -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Available Questions -->
      <div class="lg:col-span-2">
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h5 class="font-medium text-gray-900 dark:text-white">
              Available Questions ({{ filteredQuestions.length }})
            </h5>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedQuestions.length }} selected
              </span>
              <button
                @click="selectAllVisible"
                class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Select All
              </button>
            </div>
          </div>
          
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="question in paginatedQuestions"
              :key="question.id"
              class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ question.question }}
                </p>
                <div class="flex items-center space-x-2 mt-1">
                  <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                    {{ question.type }}
                  </span>
                  <span class="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                    {{ question.level }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ question.points }} pts
                  </span>
                </div>
                <div v-if="question.tags && question.tags.length > 0" class="mt-1">
                  <span
                    v-for="tag in question.tags.slice(0, 3)"
                    :key="tag"
                    class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 rounded mr-1"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="question.tags.length > 3" class="text-xs text-gray-400">
                    +{{ question.tags.length - 3 }} more
                  </span>
                </div>
              </div>
              
              <div class="flex items-center space-x-2 ml-3">
                <button
                  @click="toggleQuestionSelection(question)"
                  :class="[
                    'px-3 py-1 text-sm border rounded-md',
                    isQuestionSelected(question.id)
                      ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  ]"
                >
                  {{ isQuestionSelected(question.id) ? 'Selected' : 'Select' }}
                </button>
                
                <button
                  @click="previewQuestion(question)"
                  class="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredQuestions.length }} results
            </div>
            
            <div class="flex space-x-2">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                Previous
              </button>
              
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Selected Questions Summary -->
      <div>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h5 class="font-medium text-gray-900 dark:text-white mb-4">
            Selected Questions ({{ selectedQuestions.length }})
          </h5>
          
          <div class="space-y-3">
            <div class="p-3 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700">
              <div class="text-sm text-blue-800 dark:text-blue-200">
                <p><strong>Total Questions:</strong> {{ selectedQuestions.length }}</p>
                <p><strong>Total Points:</strong> {{ totalSelectedPoints }}</p>
                <p><strong>Categories:</strong> {{ uniqueCategories.length }}</p>
                <p><strong>Difficulty Mix:</strong></p>
                <div class="ml-2 space-y-1">
                  <div class="flex justify-between">
                    <span>Easy:</span>
                    <span>{{ difficultyCount.easy }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Medium:</span>
                    <span>{{ difficultyCount.medium }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Hard:</span>
                    <span>{{ difficultyCount.hard }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="(question, index) in selectedQuestions"
                :key="question.id"
                class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700"
              >
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 dark:text-white truncate">
                    {{ index + 1 }}. {{ question.question }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ question.points }} pts • {{ question.level }}
                  </p>
                </div>
                
                <button
                  @click="removeQuestion(question.id)"
                  class="p-1 text-red-400 hover:text-red-600"
                >
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['selection-change', 'preview-question'])

// State
const selectedQuestions = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Selection strategy
const selectionStrategy = reactive({
  method: 'manual',
  targetCount: 20,
  targetPoints: 100,
  algorithm: {
    easy: 30,
    medium: 50,
    hard: 20,
    types: ['multiple_choice', 'true_false']
  }
})

// Filters
const filters = reactive({
  category: '',
  level: '',
  type: '',
  search: '',
  minPoints: '',
  maxPoints: ''
})

// Computed
const filteredQuestions = computed(() => {
  let filtered = [...props.questions]
  
  if (filters.category) {
    filtered = filtered.filter(q => q.category === filters.category)
  }
  
  if (filters.level) {
    filtered = filtered.filter(q => q.level === filters.level)
  }
  
  if (filters.type) {
    filtered = filtered.filter(q => q.type === filters.type)
  }
  
  if (filters.search) {
    const query = filters.search.toLowerCase()
    filtered = filtered.filter(q => 
      q.question.toLowerCase().includes(query) ||
      (q.tags && q.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }
  
  if (filters.minPoints) {
    filtered = filtered.filter(q => q.points >= parseInt(filters.minPoints))
  }
  
  if (filters.maxPoints) {
    filtered = filtered.filter(q => q.points <= parseInt(filters.maxPoints))
  }
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredQuestions.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredQuestions.value.length))

const paginatedQuestions = computed(() => {
  return filteredQuestions.value.slice(startIndex.value, endIndex.value)
})

const totalSelectedPoints = computed(() => {
  return selectedQuestions.value.reduce((sum, q) => sum + q.points, 0)
})

const uniqueCategories = computed(() => {
  const categories = selectedQuestions.value.map(q => q.category)
  return [...new Set(categories)]
})

const difficultyCount = computed(() => {
  const counts = { easy: 0, medium: 0, hard: 0 }
  selectedQuestions.value.forEach(q => {
    counts[q.level] = (counts[q.level] || 0) + 1
  })
  return counts
})

const canGenerateQuestions = computed(() => {
  if (selectionStrategy.method === 'algorithm') {
    return selectionStrategy.targetCount > 0 && 
           selectionStrategy.algorithm.easy + selectionStrategy.algorithm.medium + selectionStrategy.algorithm.hard === 100
  }
  return selectionStrategy.targetCount > 0
})

// Methods
const toggleQuestionSelection = (question) => {
  const index = selectedQuestions.value.findIndex(q => q.id === question.id)
  if (index > -1) {
    selectedQuestions.value.splice(index, 1)
  } else {
    selectedQuestions.value.push(question)
  }
  emit('selection-change', selectedQuestions.value)
}

const isQuestionSelected = (questionId) => {
  return selectedQuestions.value.some(q => q.id === questionId)
}

const selectAllVisible = () => {
  paginatedQuestions.value.forEach(question => {
    if (!isQuestionSelected(question.id)) {
      selectedQuestions.value.push(question)
    }
  })
  emit('selection-change', selectedQuestions.value)
}

const removeQuestion = (questionId) => {
  const index = selectedQuestions.value.findIndex(q => q.id === questionId)
  if (index > -1) {
    selectedQuestions.value.splice(index, 1)
    emit('selection-change', selectedQuestions.value)
  }
}

const clearSelection = () => {
  selectedQuestions.value = []
  emit('selection-change', selectedQuestions.value)
}

const clearFilters = () => {
  Object.assign(filters, {
    category: '',
    level: '',
    type: '',
    search: '',
    minPoints: '',
    maxPoints: ''
  })
  currentPage.value = 1
}

const generateQuestions = () => {
  if (selectionStrategy.method === 'algorithm') {
    generateAlgorithmBasedQuestions()
  } else if (selectionStrategy.method === 'random') {
    generateRandomQuestions()
  } else if (selectionStrategy.method === 'difficulty_based') {
    generateDifficultyBasedQuestions()
  }
}

const generateAlgorithmBasedQuestions = () => {
  const available = [...props.questions]
  const selected = []
  
  // Calculate counts for each difficulty
  const easyCount = Math.round((selectionStrategy.algorithm.easy / 100) * selectionStrategy.targetCount)
  const mediumCount = Math.round((selectionStrategy.algorithm.medium / 100) * selectionStrategy.targetCount)
  const hardCount = selectionStrategy.targetCount - easyCount - mediumCount
  
  // Filter by selected types
  const typeFiltered = available.filter(q => selectionStrategy.algorithm.types.includes(q.type))
  
  // Select questions by difficulty
  const easyQuestions = typeFiltered.filter(q => q.level === 'easy').slice(0, easyCount)
  const mediumQuestions = typeFiltered.filter(q => q.level === 'medium').slice(0, mediumCount)
  const hardQuestions = typeFiltered.filter(q => q.level === 'hard').slice(0, hardCount)
  
  selected.push(...easyQuestions, ...mediumQuestions, ...hardQuestions)
  
  // Fill remaining slots if needed
  if (selected.length < selectionStrategy.targetCount) {
    const remaining = typeFiltered.filter(q => !selected.includes(q))
    const additional = remaining.slice(0, selectionStrategy.targetCount - selected.length)
    selected.push(...additional)
  }
  
  selectedQuestions.value = selected
  emit('selection-change', selectedQuestions.value)
}

const generateRandomQuestions = () => {
  const available = [...props.questions]
  const shuffled = available.sort(() => 0.5 - Math.random())
  selectedQuestions.value = shuffled.slice(0, selectionStrategy.targetCount)
  emit('selection-change', selectedQuestions.value)
}

const generateDifficultyBasedQuestions = () => {
  const available = [...props.questions]
  const easy = available.filter(q => q.level === 'easy')
  const medium = available.filter(q => q.level === 'medium')
  const hard = available.filter(q => q.level === 'hard')
  
  const easyCount = Math.round(selectionStrategy.targetCount * 0.3)
  const mediumCount = Math.round(selectionStrategy.targetCount * 0.5)
  const hardCount = selectionStrategy.targetCount - easyCount - mediumCount
  
  const selected = [
    ...easy.slice(0, easyCount),
    ...medium.slice(0, mediumCount),
    ...hard.slice(0, hardCount)
  ]
  
  selectedQuestions.value = selected
  emit('selection-change', selectedQuestions.value)
}

const previewQuestion = (question) => {
  emit('preview-question', question)
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Watch for filter changes to reset pagination
watch([filters], () => {
  currentPage.value = 1
})
</script>
