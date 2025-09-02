<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Quiz
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Category
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Date
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Score
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Time
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Status
          </th>
          <th
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="submission in submissions"
          :key="submission.id"
          class="hover:bg-gray-50 transition-colors duration-200"
        >
          <!-- Quiz Name -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <div class="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">
                  {{ submission.quiz_title || 'Unknown Quiz' }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ submission.quiz_description || 'No description' }}
                </div>
              </div>
            </div>
          </td>

          <!-- Category -->
          <td class="px-6 py-4 whitespace-nowrap">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getCategoryClasses(submission.quiz_category)"
            >
              {{ submission.quiz_category || 'Unknown' }}
            </span>
          </td>

          <!-- Date -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ formatDate(submission.completed_at || submission.started_at) }}
          </td>

          <!-- Score -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div v-if="submission.score !== null" class="flex items-center">
              <div class="text-sm font-medium text-gray-900">
                {{ submission.score }}%
              </div>
              <div class="ml-2 w-16 bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="getScoreColor(submission.score)"
                  :style="{ width: `${submission.score}%` }"
                ></div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">
              N/A
            </div>
          </td>

          <!-- Time -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ formatTime(submission.time_taken) }}
          </td>

          <!-- Status -->
          <td class="px-6 py-4 whitespace-nowrap">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getStatusClasses(submission.completed_at)"
            >
              <span
                class="w-2 h-2 rounded-full mr-1.5"
                :class="getStatusColor(submission.completed_at)"
              ></span>
              {{ submission.completed_at ? 'Completed' : 'In Progress' }}
            </span>
          </td>

          <!-- Actions -->
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex items-center space-x-2">
              <button
                type="button"
                class="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                @click="$emit('view-details', submission)"
              >
                View Details
              </button>
              
              <button
                v-if="submission.completed_at"
                type="button"
                class="text-green-600 hover:text-green-900 transition-colors duration-200"
                @click="$emit('retake-quiz', submission.quiz)"
              >
                Retake
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty State -->
    <div
      v-if="submissions.length === 0"
      class="text-center py-12"
    >
      <div class="text-gray-400">
        <svg class="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No quiz attempts yet</h3>
        <p class="text-gray-500">
          Start taking quizzes to see your history here.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  submissions: {
    type: Array,
    default: () => []
  }
})

// Emits
defineEmits(['view-details', 'retake-quiz'])

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (seconds) => {
  if (!seconds) return 'N/A'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getCategoryClasses = (category) => {
  const classMap = {
    'Excel': 'bg-green-100 text-green-800',
    'Python': 'bg-blue-100 text-blue-800',
    'Pandas': 'bg-purple-100 text-purple-800'
  }
  return classMap[category] || 'bg-gray-100 text-gray-800'
}

const getScoreColor = (score) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getStatusClasses = (completedAt) => {
  return completedAt
    ? 'bg-green-100 text-green-800'
    : 'bg-yellow-100 text-yellow-800'
}

const getStatusColor = (completedAt) => {
  return completedAt
    ? 'bg-green-400'
    : 'bg-yellow-400'
}
</script>
