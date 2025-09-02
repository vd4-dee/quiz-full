<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance Breakdown</h3>
    
    <!-- Overall Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="text-center p-4 bg-green-50 rounded-lg">
        <div class="text-2xl font-bold text-green-600">{{ correctCount }}</div>
        <div class="text-sm text-green-700">Correct</div>
      </div>
      
      <div class="text-center p-4 bg-red-50 rounded-lg">
        <div class="text-2xl font-bold text-red-600">{{ incorrectCount }}</div>
        <div class="text-sm text-red-700">Incorrect</div>
      </div>
      
      <div class="text-center p-4 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-gray-600">{{ unansweredCount }}</div>
        <div class="text-sm text-gray-700">Unanswered</div>
      </div>
      
      <div class="text-center p-4 bg-blue-50 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">{{ accuracy }}%</div>
        <div class="text-sm text-blue-700">Accuracy</div>
      </div>
    </div>

    <!-- Performance by Category -->
    <div class="mb-6">
      <h4 class="text-md font-medium text-gray-900 mb-3">Performance by Category</h4>
      <div class="space-y-3">
        <div
          v-for="category in categoryPerformance"
          :key="category.name"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-700">{{ category.name }}</span>
            <span class="text-xs text-gray-500">({{ category.total }} questions)</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">{{ category.correct }}/{{ category.total }}</div>
              <div class="text-xs text-gray-500">{{ category.percentage }}%</div>
            </div>
            
            <div class="w-20 bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="getCategoryColor(category.percentage)"
                :style="{ width: `${category.percentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance by Difficulty -->
    <div class="mb-6">
      <h4 class="text-md font-medium text-gray-900 mb-3">Performance by Difficulty</h4>
      <div class="space-y-3">
        <div
          v-for="difficulty in difficultyPerformance"
          :key="difficulty.name"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-700">{{ difficulty.name }}</span>
            <span class="text-xs text-gray-500">({{ difficulty.total }} questions)</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">{{ difficulty.correct }}/{{ difficulty.total }}</div>
              <div class="text-xs text-gray-500">{{ difficulty.percentage }}%</div>
            </div>
            
            <div class="w-20 bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="getDifficultyColor(difficulty.name, difficulty.percentage)"
                :style="{ width: `${difficulty.percentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance by Question Type -->
    <div>
      <h4 class="text-md font-medium text-gray-900 mb-3">Performance by Question Type</h4>
      <div class="space-y-3">
        <div
          v-for="type in questionTypePerformance"
          :key="type.name"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <span class="text-sm font-medium text-gray-700">{{ type.name }}</span>
            <span class="text-xs text-gray-500">({{ type.total }} questions)</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900">{{ type.correct }}/{{ type.total }}</div>
              <div class="text-xs text-gray-500">{{ type.percentage }}%</div>
            </div>
            
            <div class="w-20 bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="getTypeColor(type.percentage)"
                :style="{ width: `${type.percentage}%` }"
              ></div>
            </div>
          </div>
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
const correctCount = computed(() => {
  let count = 0
  props.questions.forEach(question => {
    const userAnswer = props.userAnswers[question.id]
    if (userAnswer && isAnswerCorrect(question, userAnswer)) {
      count++
    }
  })
  return count
})

const incorrectCount = computed(() => {
  let count = 0
  props.questions.forEach(question => {
    const userAnswer = props.userAnswers[question.id]
    if (userAnswer && !isAnswerCorrect(question, userAnswer)) {
      count++
    }
  })
  return count
})

const unansweredCount = computed(() => {
  return props.questions.length - correctCount.value - incorrectCount.value
})

const accuracy = computed(() => {
  if (correctCount.value + incorrectCount.value === 0) return 0
  return Math.round((correctCount.value / (correctCount.value + incorrectCount.value)) * 100)
})

const categoryPerformance = computed(() => {
  const categories = {}
  
  props.questions.forEach(question => {
    if (!categories[question.category]) {
      categories[question.category] = { total: 0, correct: 0 }
    }
    
    categories[question.category].total++
    
    const userAnswer = props.userAnswers[question.id]
    if (userAnswer && isAnswerCorrect(question, userAnswer)) {
      categories[question.category].correct++
    }
  })
  
  return Object.entries(categories).map(([name, stats]) => ({
    name,
    total: stats.total,
    correct: stats.correct,
    percentage: Math.round((stats.correct / stats.total) * 100)
  }))
})

const difficultyPerformance = computed(() => {
  const difficulties = {}
  
  props.questions.forEach(question => {
    if (!difficulties[question.level]) {
      difficulties[question.level] = { total: 0, correct: 0 }
    }
    
    difficulties[question.level].total++
    
    const userAnswer = props.userAnswers[question.id]
    if (userAnswer && isAnswerCorrect(question, userAnswer)) {
      difficulties[question.level].correct++
    }
  })
  
  return Object.entries(difficulties).map(([name, stats]) => ({
    name,
    total: stats.total,
    correct: stats.correct,
    percentage: Math.round((stats.correct / stats.total) * 100)
  }))
})

const questionTypePerformance = computed(() => {
  const types = {}
  
  props.questions.forEach(question => {
    if (!types[question.question_type]) {
      types[question.question_type] = { total: 0, correct: 0 }
    }
    
    types[question.question_type].total++
    
    const userAnswer = props.userAnswers[question.id]
    if (userAnswer && isAnswerCorrect(question, userAnswer)) {
      types[question.question_type].correct++
    }
  })
  
  return Object.entries(types).map(([name, stats]) => ({
    name,
    total: stats.total,
    correct: stats.correct,
    percentage: Math.round((stats.correct / stats.total) * 100)
  }))
})

// Methods
const isAnswerCorrect = (question, userAnswer) => {
  if (question.question_type === 'Multiple Choice') {
    const correctAnswers = question.correct_answers || []
    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    
    return correctAnswers.length === userAnswers.length &&
           correctAnswers.every(correct => userAnswers.includes(correct))
  } else {
    return userAnswer === question.correct_answers?.[0]
  }
}

const getCategoryColor = (percentage) => {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getDifficultyColor = (difficulty, percentage) => {
  if (difficulty === 'Very Hard' && percentage >= 60) return 'bg-green-500'
  if (difficulty === 'Hard' && percentage >= 70) return 'bg-green-500'
  if (difficulty === 'Normal' && percentage >= 80) return 'bg-green-500'
  if (difficulty === 'Easy' && percentage >= 90) return 'bg-green-500'
  
  if (percentage >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getTypeColor = (percentage) => {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>
