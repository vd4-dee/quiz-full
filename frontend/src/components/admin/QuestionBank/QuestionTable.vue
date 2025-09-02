<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
    <!-- Table Header with Actions -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">Questions</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ filteredQuestions.length }} of {{ questions.length }} questions
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-2">
          <button
            @click="showBulkActions = !showBulkActions"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md border',
              showBulkActions
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
            ]"
          >
            Bulk Actions
          </button>
          <button
            @click="$emit('create')"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Add Question
          </button>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="showBulkActions" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ selectedQuestions.length }} questions selected
          </span>
          
          <button
            @click="bulkDelete"
            :disabled="selectedQuestions.length === 0"
            class="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Selected
          </button>
          
          <button
            @click="bulkExport"
            :disabled="selectedQuestions.length === 0"
            class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export Selected
          </button>
          
          <button
            @click="bulkChangeCategory"
            :disabled="selectedQuestions.length === 0"
            class="px-3 py-1 text-sm text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Change Category
          </button>
          
          <button
            @click="clearSelection"
            class="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Search -->
        <div class="lg:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Questions
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by question text, tags, or explanation..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Category Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
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

        <!-- Level Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Level
          </label>
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
      </div>

      <!-- Advanced Filters -->
      <div class="mt-4 flex flex-wrap items-center gap-4">
        <button
          @click="showAdvancedFilters = !showAdvancedFilters"
          class="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {{ showAdvancedFilters ? 'Hide' : 'Show' }} Advanced Filters
        </button>
        
        <button
          @click="clearFilters"
          class="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Clear All Filters
        </button>
      </div>

      <!-- Advanced Filters Panel -->
      <div v-if="showAdvancedFilters" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question Type
            </label>
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

          <!-- Points Range -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Points Range
            </label>
            <div class="flex space-x-2">
              <input
                v-model="filters.minPoints"
                type="number"
                placeholder="Min"
                class="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <span class="text-gray-500 dark:text-gray-400 self-center">-</span>
              <input
                v-model="filters.maxPoints"
                type="number"
                placeholder="Max"
                class="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <!-- Tags Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              v-model="filters.tags"
              type="text"
              placeholder="Filter by tags (comma separated)"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Question
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Category
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Level
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Points
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="question in paginatedQuestions"
            :key="question.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="checkbox"
                :value="question.id"
                v-model="selectedQuestions"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td class="px-6 py-4">
              <div class="max-w-xs">
                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ question.question }}
                </div>
                <div v-if="question.tags && question.tags.length > 0" class="mt-1">
                  <span
                    v-for="tag in question.tags.slice(0, 2)"
                    :key="tag"
                    class="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full mr-1"
                  >
                    {{ tag }}
                  </span>
                  <span v-if="question.tags.length > 2" class="text-xs text-gray-500 dark:text-gray-400">
                    +{{ question.tags.length - 2 }} more
                  </span>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getTypeBadgeClass(question.type)
                ]"
              >
                {{ formatQuestionType(question.type) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ formatCategory(question.category) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getLevelBadgeClass(question.level)
                ]"
              >
                {{ formatLevel(question.level) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ question.points }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button
                  @click="$emit('edit', question)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Edit
                </button>
                <button
                  @click="$emit('preview', question)"
                  class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                >
                  Preview
                </button>
                <button
                  @click="deleteQuestion(question.id)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredQuestions.length }} results
          </span>
        </div>
        
        <div class="flex items-center space-x-2">
          <select
            v-model="itemsPerPage"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
          
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
          >
            Previous
          </button>
          
          <div class="flex space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 text-sm border rounded-md',
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
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
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['create', 'edit', 'preview', 'delete', 'bulk-delete', 'bulk-export', 'bulk-category-change'])

// State
const searchQuery = ref('')
const showBulkActions = ref(false)
const showAdvancedFilters = ref(false)
const selectedQuestions = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(25)

// Filters
const filters = ref({
  category: '',
  level: '',
  type: '',
  minPoints: '',
  maxPoints: '',
  tags: ''
})

// Computed
const filteredQuestions = computed(() => {
  let filtered = [...props.questions]
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(question => 
      question.question.toLowerCase().includes(query) ||
      (question.tags && question.tags.some(tag => tag.toLowerCase().includes(query))) ||
      (question.explanation && question.explanation.toLowerCase().includes(query))
    )
  }
  
  // Category filter
  if (filters.value.category) {
    filtered = filtered.filter(question => question.category === filters.value.category)
  }
  
  // Level filter
  if (filters.value.level) {
    filtered = filtered.filter(question => question.level === filters.value.level)
  }
  
  // Type filter
  if (filters.value.type) {
    filtered = filtered.filter(question => question.type === filters.value.type)
  }
  
  // Points range filter
  if (filters.value.minPoints) {
    filtered = filtered.filter(question => question.points >= parseInt(filters.value.minPoints))
  }
  if (filters.value.maxPoints) {
    filtered = filtered.filter(question => question.points <= parseInt(filters.value.maxPoints))
  }
  
  // Tags filter
  if (filters.value.tags) {
    const tagList = filters.value.tags.split(',').map(tag => tag.trim().toLowerCase())
    filtered = filtered.filter(question => 
      question.tags && question.tags.some(tag => tagList.includes(tag.toLowerCase()))
    )
  }
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredQuestions.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredQuestions.value.length))

const paginatedQuestions = computed(() => {
  return filteredQuestions.value.slice(startIndex.value, endIndex.value)
})

const isAllSelected = computed(() => {
  return paginatedQuestions.value.length > 0 && selectedQuestions.value.length === paginatedQuestions.value.length
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedQuestions.value = []
  } else {
    selectedQuestions.value = paginatedQuestions.value.map(q => q.id)
  }
}

const clearSelection = () => {
  selectedQuestions.value = []
}

const clearFilters = () => {
  searchQuery.value = ''
  filters.value = {
    category: '',
    level: '',
    type: '',
    minPoints: '',
    maxPoints: '',
    tags: ''
  }
  currentPage.value = 1
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

const goToPage = (page) => {
  currentPage.value = page
}

const deleteQuestion = (id) => {
  if (confirm('Are you sure you want to delete this question?')) {
    emit('delete', id)
  }
}

const bulkDelete = () => {
  if (confirm(`Are you sure you want to delete ${selectedQuestions.value.length} questions?`)) {
    emit('bulk-delete', selectedQuestions.value)
    selectedQuestions.value = []
  }
}

const bulkExport = () => {
  emit('bulk-export', selectedQuestions.value)
}

const bulkChangeCategory = () => {
  const newCategory = prompt('Enter new category:')
  if (newCategory) {
    emit('bulk-category-change', { questionIds: selectedQuestions.value, category: newCategory })
    selectedQuestions.value = []
  }
}

const formatQuestionType = (type) => {
  const types = {
    multiple_choice: 'Multiple Choice',
    true_false: 'True/False',
    short_answer: 'Short Answer',
    essay: 'Essay'
  }
  return types[type] || type
}

const formatCategory = (category) => {
  const categories = {
    mathematics: 'Mathematics',
    science: 'Science',
    history: 'History',
    literature: 'Literature',
    geography: 'Geography',
    computer_science: 'Computer Science'
  }
  return categories[category] || category
}

const formatLevel = (level) => {
  const levels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  }
  return levels[level] || level
}

const getTypeBadgeClass = (type) => {
  const classes = {
    multiple_choice: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    true_false: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    short_answer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    essay: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
  return classes[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

const getLevelBadgeClass = (level) => {
  const classes = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return classes[level] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
}

// Watch for filter changes to reset pagination
watch([filters, searchQuery], () => {
  currentPage.value = 1
})

// Watch for questions changes to clear selection
watch(() => props.questions, () => {
  selectedQuestions.value = []
})
</script>
