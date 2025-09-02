<template>
  <div class="bg-white rounded-lg shadow-sm border p-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Search Input -->
      <div class="flex-1">
        <label for="search" class="sr-only">Search quizzes</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search"
            v-model="searchQuery"
            type="text"
            class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search quizzes..."
            @input="handleSearchInput"
          />
        </div>
      </div>

      <!-- Category Filter -->
      <div class="sm:w-32">
        <label for="category" class="sr-only">Category</label>
        <select
          id="category"
          v-model="categoryQuery"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          @change="handleCategoryChange"
        >
          <option value="All">All Categories</option>
          <option value="Excel">Excel</option>
          <option value="Python">Python</option>
          <option value="Pandas">Pandas</option>
        </select>
      </div>

      <!-- Difficulty Filter -->
      <div class="sm:w-32">
        <label for="difficulty" class="sr-only">Difficulty</label>
        <select
          id="difficulty"
          v-model="difficultyQuery"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          @change="handleDifficultyChange"
        >
          <option value="All">All Levels</option>
          <option value="Easy">Easy</option>
          <option value="Normal">Normal</option>
          <option value="Hard">Hard</option>
          <option value="Very Hard">Very Hard</option>
        </select>
      </div>

      <!-- Status Filter -->
      <div class="sm:w-32">
        <label for="status" class="sr-only">Status</label>
        <select
          id="status"
          v-model="statusQuery"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          @change="handleStatusChange"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Expired">Expired</option>
        </select>
      </div>

      <!-- Clear Filters Button -->
      <div class="sm:w-auto">
        <button
          type="button"
          class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="clearFilters"
        >
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-3 pt-3 border-t border-gray-100">
      <div class="flex flex-wrap gap-2">
        <span class="text-sm text-gray-500">Active filters:</span>
        <span
          v-for="filter in activeFilters"
          :key="filter.key"
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {{ filter.label }}
          <button
            type="button"
            class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
            @click="removeFilter(filter.key)"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  category: {
    type: String,
    default: 'All'
  },
  difficulty: {
    type: String,
    default: 'All'
  },
  status: {
    type: String,
    default: 'Available'
  },
  search: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:category', 'update:difficulty', 'update:status', 'update:search', 'filter-change'])

// Local state
const searchQuery = ref(props.search)
const categoryQuery = ref(props.category)
const difficultyQuery = ref(props.difficulty)
const statusQuery = ref(props.status)

// Computed properties
const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         categoryQuery.value !== 'All' || 
         difficultyQuery.value !== 'All' || 
         statusQuery.value !== 'All'
})

const activeFilters = computed(() => {
  const filters = []
  
  if (searchQuery.value) {
    filters.push({ key: 'search', label: `Search: "${searchQuery.value}"` })
  }
  if (categoryQuery.value !== 'All') {
    filters.push({ key: 'category', label: `Category: ${categoryQuery.value}` })
  }
  if (difficultyQuery.value !== 'All') {
    filters.push({ key: 'difficulty', label: `Level: ${difficultyQuery.value}` })
  }
  if (statusQuery.value !== 'All') {
    filters.push({ key: 'status', label: `Status: ${statusQuery.value}` })
  }
  
  return filters
})

// Methods
const handleSearchInput = () => {
  emit('update:search', searchQuery.value)
  emit('filter-change')
}

const handleCategoryChange = () => {
  emit('update:category', categoryQuery.value)
  emit('filter-change')
}

const handleDifficultyChange = () => {
  emit('update:difficulty', difficultyQuery.value)
  emit('filter-change')
}

const handleStatusChange = () => {
  emit('update:status', statusQuery.value)
  emit('filter-change')
}

const clearFilters = () => {
  searchQuery.value = ''
  categoryQuery.value = 'All'
  difficultyQuery.value = 'All'
  statusQuery.value = 'All'
  
  emit('update:search', '')
  emit('update:category', 'All')
  emit('update:difficulty', 'All')
  emit('update:status', 'All')
  emit('filter-change')
}

const removeFilter = (filterKey) => {
  switch (filterKey) {
    case 'search':
      searchQuery.value = ''
      emit('update:search', '')
      break
    case 'category':
      categoryQuery.value = 'All'
      emit('update:category', 'All')
      break
    case 'difficulty':
      difficultyQuery.value = 'All'
      emit('update:difficulty', 'All')
      break
    case 'status':
      statusQuery.value = 'All'
      emit('update:status', 'All')
      break
  }
  emit('filter-change')
}

// Watch for prop changes
watch(() => props.search, (newValue) => {
  searchQuery.value = newValue
})

watch(() => props.category, (newValue) => {
  categoryQuery.value = newValue
})

watch(() => props.difficulty, (newValue) => {
  difficultyQuery.value = newValue
})

watch(() => props.status, (newValue) => {
  statusQuery.value = newValue
})
</script>
