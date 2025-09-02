<template>
  <div class="bg-white rounded-lg shadow-sm border p-8 text-center">
    <!-- Main Score -->
    <div class="mb-8">
      <div class="text-6xl font-bold text-blue-600 mb-2">{{ normalizedScore }}%</div>
      <div class="text-xl text-gray-600">Final Score</div>
      
      <!-- Pass/Fail Status -->
      <div v-if="passThreshold" class="mt-4">
        <span
          class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
          :class="isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
        >
          <svg v-if="isPassed" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {{ isPassed ? 'PASSED' : 'FAILED' }}
        </span>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Questions Answered -->
      <div class="text-center">
        <div class="text-3xl font-bold text-green-600">{{ totalQuestions }}</div>
        <div class="text-sm text-gray-500">Total Questions</div>
      </div>
      
      <!-- Time Taken -->
      <div class="text-center">
        <div class="text-3xl font-bold text-purple-600">{{ formatTime(timeTaken) }}</div>
        <div class="text-sm text-gray-500">Time Taken</div>
        <div class="text-xs text-gray-400 mt-1">
          {{ formatTime(quizDuration) }} allocated
        </div>
      </div>
      
      <!-- Efficiency -->
      <div class="text-center">
        <div class="text-3xl font-bold text-orange-600">{{ efficiencyScore }}%</div>
        <div class="text-sm text-gray-500">Efficiency</div>
        <div class="text-xs text-gray-400 mt-1">
          {{ efficiencyText }}
        </div>
      </div>
    </div>

    <!-- Performance Ring -->
    <div class="mt-8 flex justify-center">
      <div class="relative w-32 h-32">
        <!-- Background Circle -->
        <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="currentColor"
            stroke-width="2"
            fill="transparent"
            class="text-gray-200"
          />
        </svg>
        
        <!-- Progress Circle -->
        <svg class="w-32 h-32 transform -rotate-90 absolute inset-0" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="currentColor"
            stroke-width="2"
            fill="transparent"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            class="text-blue-600 transition-all duration-1000 ease-out"
            stroke-linecap="round"
          />
        </svg>
        
        <!-- Center Text -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ normalizedScore }}%</div>
            <div class="text-xs text-gray-500">Score</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Message -->
    <div class="mt-6">
      <div class="text-lg font-medium text-gray-900 mb-2">{{ performanceMessage }}</div>
      <div class="text-sm text-gray-600">{{ performanceDescription }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  score: {
    type: [Number, String],
    required: true,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  quizDuration: {
    type: Number,
    default: 0
  },
  passThreshold: {
    type: Number,
    default: 70
  }
})

// Computed properties
const normalizedScore = computed(() => {
  // Ensure score is a number and handle edge cases
  let score = props.score;
  
  if (score === null || score === undefined || score === '') {
    console.warn('⚠️ ResultsDisplay: Score is null/undefined/empty, using 0');
    return 0;
  }
  
  if (typeof score === 'string') {
    score = parseFloat(score);
    if (isNaN(score)) {
      console.warn('⚠️ ResultsDisplay: Score string cannot be parsed, using 0');
      return 0;
    }
  }
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  console.log('🔍 ResultsDisplay: Normalized score:', {
    original: props.score,
    normalized: score,
    type: typeof score
  });
  
  return score;
});

const isPassed = computed(() => {
  return normalizedScore.value >= props.passThreshold;
})

const circumference = computed(() => {
  return 2 * Math.PI * 14
})

const strokeDashoffset = computed(() => {
  const progress = normalizedScore.value / 100
  return circumference.value * (1 - progress)
})

const efficiencyScore = computed(() => {
  if (props.quizDuration === 0) return 0
  
  const timeRatio = props.timeTaken / (props.quizDuration * 60)
  const efficiency = (1 - timeRatio) * 100
  
  return Math.max(0, Math.min(100, Math.round(efficiency)))
})

const efficiencyText = computed(() => {
  if (props.efficiencyScore >= 80) return 'Excellent pace'
  if (props.efficiencyScore >= 60) return 'Good pace'
  if (props.efficiencyScore >= 40) return 'Average pace'
  return 'Could be faster'
})

const performanceMessage = computed(() => {
  if (normalizedScore.value >= 90) return 'Outstanding Performance! 🎉'
  if (normalizedScore.value >= 80) return 'Great Job! 👏'
  if (normalizedScore.value >= 70) return 'Well Done! 👍'
  if (normalizedScore.value >= 60) return 'Good Effort! 💪'
  if (normalizedScore.value >= 50) return 'Keep Practicing! 📚'
  return 'More Practice Needed 📖'
})

const performanceDescription = computed(() => {
  if (normalizedScore.value >= 90) return 'You have excellent knowledge of this subject!'
  if (normalizedScore.value >= 80) return 'You have a strong understanding of the material.'
  if (normalizedScore.value >= 70) return 'You have a good grasp of the concepts.'
  if (normalizedScore.value >= 60) return 'You understand the basics well.'
  if (normalizedScore.value >= 50) return 'You have some understanding but need more practice.'
  return 'Review the material and try again to improve your score.'
})

// Methods
const formatTime = (seconds) => {
  if (seconds === 0) return '0:00'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>
