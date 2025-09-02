<template>
  <div class="bg-white rounded-lg shadow-sm border p-4">
    <h3 class="text-sm font-medium text-gray-500 mb-3">Your Progress</h3>
    
    <div class="grid grid-cols-2 gap-4">
      <!-- Quizzes Completed -->
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600">{{ stats.quizzesCompleted }}</div>
        <div class="text-xs text-gray-500">Quizzes</div>
      </div>
      
      <!-- Average Score -->
      <div class="text-center">
        <div class="text-2xl font-bold text-green-600">{{ stats.averageScore }}%</div>
        <div class="text-xs text-gray-500">Avg Score</div>
      </div>
      
      <!-- Time Spent -->
      <div class="text-center">
        <div class="text-2xl font-bold text-purple-600">{{ stats.timeSpent }}</div>
        <div class="text-xs text-gray-500">Minutes</div>
      </div>
      
      <!-- Progress Streak -->
      <div class="text-center">
        <div class="text-2xl font-bold text-orange-600">{{ stats.progressStreak }}</div>
        <div class="text-xs text-gray-500">Day Streak</div>
      </div>
    </div>
    
    <!-- Progress Streak Indicator -->
    <div v-if="stats.progressStreak > 0" class="mt-3 pt-3 border-t border-gray-100">
      <div class="flex items-center justify-center">
        <div class="flex items-center space-x-1">
          <span class="text-orange-500">🔥</span>
          <span class="text-sm text-gray-600">
            {{ stats.progressStreak }} day{{ stats.progressStreak > 1 ? 's' : '' }} in a row!
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      quizzesCompleted: 0,
      averageScore: 0,
      timeSpent: 0,
      progressStreak: 0
    })
  }
})
</script>
