<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Dynamic Quiz Generator</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Generate quizzes automatically using advanced algorithms and criteria
      </p>
    </div>

    <!-- Generation Criteria -->
    <div class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <h4 class="font-medium text-gray-900 dark:text-white mb-4">Generation Criteria</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Question Count
          </label>
          <input
            v-model="criteria.targetCount"
            type="number"
            min="5"
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
            v-model="criteria.targetPoints"
            type="number"
            min="10"
            max="1000"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="100"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Limit (minutes)
          </label>
          <input
            v-model="criteria.timeLimit"
            type="number"
            min="5"
            max="180"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="30"
          />
        </div>
      </div>
    </div>

    <!-- Difficulty Distribution -->
    <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <h4 class="font-medium text-gray-900 dark:text-white mb-4">Difficulty Distribution</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Easy Questions (%)
          </label>
          <div class="flex items-center space-x-2">
            <input
              v-model="criteria.difficulty.easy"
              type="range"
              min="0"
              max="100"
              step="5"
              class="flex-1"
            />
            <span class="text-sm font-medium text-gray-900 dark:text-white w-12">
              {{ criteria.difficulty.easy }}%
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ Math.round((criteria.difficulty.easy / 100) * criteria.targetCount) }} questions
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Medium Questions (%)
          </label>
          <div class="flex items-center space-x-2">
            <input
              v-model="criteria.difficulty.medium"
              type="range"
              min="0"
              max="100"
              step="5"
              class="flex-1"
            />
            <span class="text-sm font-medium text-gray-900 dark:text-white w-12">
              {{ criteria.difficulty.medium }}%
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ Math.round((criteria.difficulty.medium / 100) * criteria.targetCount) }} questions
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hard Questions (%)
          </label>
          <div class="flex items-center space-x-2">
            <input
              v-model="criteria.difficulty.hard"
              type="range"
              min="0"
              max="100"
              step="5"
              class="flex-1"
            />
            <span class="text-sm font-medium text-gray-900 dark:text-white w-12">
              {{ criteria.difficulty.hard }}%
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ Math.round((criteria.difficulty.hard / 100) * criteria.targetCount) }} questions
          </p>
        </div>
      </div>
      
      <!-- Distribution Validation -->
      <div class="mt-4 p-3 rounded-lg" :class="distributionStatus.class">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">{{ distributionStatus.message }}</span>
          <span class="text-sm">{{ distributionStatus.total }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <div
            class="h-2 rounded-full transition-all duration-300"
            :class="distributionStatus.barClass"
            :style="{ width: `${Math.min(distributionStatus.total, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Question Type Preferences -->
    <div class="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
      <h4 class="font-medium text-gray-900 dark:text-white mb-4">Question Type Preferences</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Types
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                v-model="criteria.types"
                type="checkbox"
                value="multiple_choice"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Multiple Choice</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="criteria.types"
                type="checkbox"
                value="true_false"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">True/False</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="criteria.types"
                type="checkbox"
                value="short_answer"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Short Answer</span>
            </label>
            <label class="flex items-center">
              <input
                v-model="criteria.types"
                type="checkbox"
                value="essay"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Essay</span>
            </label>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category Focus
          </label>
          <select
            v-model="criteria.category"
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
          
          <div class="mt-3">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags Filter
            </label>
            <input
              v-model="criteria.tags"
              type="text"
              placeholder="Enter tags (comma separated)"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Options -->
    <div class="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
      <h4 class="font-medium text-gray-900 dark:text-white mb-4">Advanced Options</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Algorithm Type
          </label>
          <select
            v-model="criteria.algorithm"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="balanced">Balanced Distribution</option>
            <option value="adaptive">Adaptive Difficulty</option>
            <option value="random">Random Selection</option>
            <option value="performance_based">Performance-based</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quality Threshold
          </label>
          <select
            v-model="criteria.qualityThreshold"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="high">High Quality Only</option>
            <option value="medium">Medium+ Quality</option>
            <option value="low">All Questions</option>
          </select>
        </div>
      </div>
      
      <div class="mt-4">
        <label class="flex items-center">
          <input
            v-model="criteria.avoidDuplicates"
            type="checkbox"
            class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Avoid duplicate questions from recent quizzes
          </span>
        </label>
      </div>
    </div>

    <!-- Generation Actions -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-gray-900 dark:text-white">Ready to Generate</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ availableQuestionsCount }} questions available in database
          </p>
        </div>
        
        <div class="flex space-x-3">
          <button
            @click="previewGeneration"
            :disabled="!canGenerate"
            class="px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview
          </button>
          
          <button
            @click="generateQuiz"
            :disabled="!canGenerate || isGenerating"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isGenerating" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
            <span v-else>Generate Quiz</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Generated Quiz Preview -->
    <div v-if="generatedQuestions.length > 0" class="mb-6">
      <h4 class="font-medium text-gray-900 dark:text-white mb-4">Generated Quiz Preview</h4>
      
      <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p class="text-gray-600 dark:text-gray-400">Questions Generated</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ generatedQuestions.length }}</p>
          </div>
          
          <div>
            <p class="text-gray-600 dark:text-gray-400">Total Points</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ totalGeneratedPoints }}</p>
          </div>
          
          <div>
            <p class="text-gray-600 dark:text-gray-400">Estimated Time</p>
            <p class="font-medium text-gray-900 dark:text-white">{{ estimatedGeneratedTime }} min</p>
          </div>
        </div>
      </div>
      
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="(question, index) in generatedQuestions"
          :key="question.id"
          class="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ index + 1 }}. {{ question.question }}
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
          </div>
          
          <button
            @click="removeGeneratedQuestion(index)"
            class="p-1 text-red-400 hover:text-red-600"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end space-x-3">
        <button
          @click="regenerateQuiz"
          class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Regenerate
        </button>
        
        <button
          @click="useGeneratedQuiz"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Use This Quiz
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['quiz-generated', 'preview-questions'])

// State
const isGenerating = ref(false)
const generatedQuestions = ref([])

// Criteria
const criteria = reactive({
  targetCount: 20,
  targetPoints: 100,
  timeLimit: 30,
  difficulty: {
    easy: 30,
    medium: 50,
    hard: 20
  },
  types: ['multiple_choice', 'true_false'],
  category: '',
  tags: '',
  algorithm: 'balanced',
  qualityThreshold: 'medium',
  avoidDuplicates: true
})

// Computed
const availableQuestionsCount = computed(() => props.questions.length)

const distributionStatus = computed(() => {
  const total = criteria.difficulty.easy + criteria.difficulty.medium + criteria.difficulty.hard
  
  if (total === 100) {
    return {
      message: 'Perfect distribution!',
      total: total,
      class: 'bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700',
      barClass: 'bg-green-500'
    }
  } else if (total > 100) {
    return {
      message: 'Distribution exceeds 100%',
      total: total,
      class: 'bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-700',
      barClass: 'bg-red-500'
    }
  } else {
    return {
      message: 'Distribution incomplete',
      total: total,
      class: 'bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-700',
      barClass: 'bg-yellow-500'
    }
  }
})

const canGenerate = computed(() => {
  return criteria.targetCount > 0 && 
         criteria.targetPoints > 0 &&
         criteria.types.length > 0 &&
         distributionStatus.value.total === 100
})

const totalGeneratedPoints = computed(() => {
  return generatedQuestions.value.reduce((sum, q) => sum + q.points, 0)
})

const estimatedGeneratedTime = computed(() => {
  const timePerQuestion = generatedQuestions.value.reduce((sum, q) => {
    const baseTime = q.level === 'easy' ? 1 : q.level === 'medium' ? 1.5 : 2
    return sum + baseTime
  }, 0)
  return Math.round(timePerQuestion)
})

// Methods
const previewGeneration = () => {
  const previewQuestions = generateQuestionsLogic()
  emit('preview-questions', previewQuestions)
}

const generateQuiz = async () => {
  if (!canGenerate.value) return
  
  isGenerating.value = true
  
  try {
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    generatedQuestions.value = generateQuestionsLogic()
    
    emit('quiz-generated', {
      questions: generatedQuestions.value,
      criteria: { ...criteria },
      totalPoints: totalGeneratedPoints.value,
      estimatedTime: estimatedGeneratedTime.value
    })
  } catch (error) {
    console.error('Error generating quiz:', error)
  } finally {
    isGenerating.value = false
  }
}

const generateQuestionsLogic = () => {
  let available = [...props.questions]
  
  // Apply filters
  if (criteria.category) {
    available = available.filter(q => q.category === criteria.category)
  }
  
  if (criteria.types.length > 0) {
    available = available.filter(q => criteria.types.includes(q.type))
  }
  
  if (criteria.tags) {
    const tagList = criteria.tags.split(',').map(t => t.trim().toLowerCase())
    available = available.filter(q => 
      q.tags && q.tags.some(tag => tagList.includes(tag.toLowerCase()))
    )
  }
  
  // Apply quality threshold
  if (criteria.qualityThreshold === 'high') {
    available = available.filter(q => q.points >= 3)
  } else if (criteria.qualityThreshold === 'medium') {
    available = available.filter(q => q.points >= 2)
  }
  
  // Calculate counts for each difficulty
  const easyCount = Math.round((criteria.difficulty.easy / 100) * criteria.targetCount)
  const mediumCount = Math.round((criteria.difficulty.medium / 100) * criteria.targetCount)
  const hardCount = criteria.targetCount - easyCount - mediumCount
  
  // Select questions by difficulty
  const easyQuestions = available.filter(q => q.level === 'easy').slice(0, easyCount)
  const mediumQuestions = available.filter(q => q.level === 'medium').slice(0, mediumCount)
  const hardQuestions = available.filter(q => q.level === 'hard').slice(0, hardCount)
  
  let selected = [...easyQuestions, ...mediumQuestions, ...hardQuestions]
  
  // Fill remaining slots if needed
  if (selected.length < criteria.targetCount) {
    const remaining = available.filter(q => !selected.includes(q))
    const additional = remaining.slice(0, criteria.targetCount - selected.length)
    selected.push(...additional)
  }
  
  // Apply algorithm-specific logic
  if (criteria.algorithm === 'balanced') {
    selected = selected.sort((a, b) => a.points - b.points)
  } else if (criteria.algorithm === 'random') {
    selected = selected.sort(() => 0.5 - Math.random())
  } else if (criteria.algorithm === 'adaptive') {
    // Sort by difficulty level for adaptive progression
    const levelOrder = { easy: 1, medium: 2, hard: 3 }
    selected = selected.sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
  }
  
  return selected.slice(0, criteria.targetCount)
}

const removeGeneratedQuestion = (index) => {
  generatedQuestions.value.splice(index, 1)
}

const regenerateQuiz = () => {
  generatedQuestions.value = generateQuestionsLogic()
}

const useGeneratedQuiz = () => {
  emit('quiz-generated', {
    questions: generatedQuestions.value,
    criteria: { ...criteria },
    totalPoints: totalGeneratedPoints.value,
    estimatedTime: estimatedGeneratedTime.value
  })
}

// Watch for criteria changes to reset generated questions
watch([criteria], () => {
  generatedQuestions.value = []
})
</script>
