<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      difficultyClasses
    ]"
  >
    <span class="w-2 h-2 rounded-full mr-1.5" :class="dotClasses"></span>
    {{ difficultyLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  difficulty: {
    type: String,
    required: true,
    validator: (value) => ['beginner', 'intermediate', 'advanced'].includes(value)
  }
})

const difficultyLabel = computed(() => {
  switch (props.difficulty) {
    case 'beginner':
      return 'Beginner'
    case 'intermediate':
      return 'Intermediate'
    case 'advanced':
      return 'Advanced'
    default:
      return 'Unknown'
  }
})

const difficultyClasses = computed(() => {
  switch (props.difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800'
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800'
    case 'advanced':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const dotClasses = computed(() => {
  switch (props.difficulty) {
    case 'beginner':
      return 'bg-green-400'
    case 'intermediate':
      return 'bg-yellow-400'
    case 'advanced':
      return 'bg-red-400'
    default:
      return 'bg-gray-400'
  }
})
</script>
