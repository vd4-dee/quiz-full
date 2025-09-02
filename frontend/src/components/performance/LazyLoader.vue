<template>
  <div class="lazy-loader">
    <!-- Loading skeleton -->
    <div v-if="!isLoaded" class="loading-skeleton">
      <div class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
    
    <!-- Actual content -->
    <div v-else class="loaded-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  delay: {
    type: Number,
    default: 0
  },
  threshold: {
    type: Number,
    default: 0.1
  }
})

const isLoaded = ref(false)

onMounted(() => {
  if (props.delay > 0) {
    setTimeout(() => {
      isLoaded.value = true
    }, props.delay)
  } else {
    isLoaded.value = true
  }
})
</script>

<style scoped>
.lazy-loader {
  @apply w-full;
}

.loading-skeleton {
  @apply p-4;
}

.loaded-content {
  @apply animate-fade-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
