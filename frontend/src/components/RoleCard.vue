<template>
  <div 
    class="bg-white rounded-xl shadow-lg border border-gray-200 p-8 cursor-pointer hover:shadow-xl transition-all duration-300"
    @click="$emit('click')"
  >
    <!-- Icon Section -->
    <div class="flex justify-center mb-6">
      <div class="w-20 h-20 rounded-full flex items-center justify-center" :class="iconClasses">
        <svg v-if="icon === 'admin'" class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <svg v-else-if="icon === 'student'" class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 19 16.5 19c-1.746 0-3.332-.477-4.5-1.253" />
        </svg>
      </div>
    </div>

    <!-- Title and Description -->
    <div class="text-center mb-6">
      <h3 class="text-2xl font-bold text-gray-900 mb-3">{{ title }}</h3>
      <p class="text-gray-600 text-lg leading-relaxed">{{ description }}</p>
    </div>

    <!-- Features List -->
    <div class="mb-8">
      <ul class="space-y-3">
        <li 
          v-for="feature in features" 
          :key="feature"
          class="flex items-center text-gray-700"
        >
          <svg class="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ feature }}
        </li>
      </ul>
    </div>

    <!-- Last Accessed Info -->
    <div v-if="lastAccessed" class="text-center mb-6">
      <p class="text-sm text-gray-500">
        Last accessed: <span class="font-medium text-gray-700">{{ lastAccessed }}</span>
      </p>
    </div>

    <!-- Action Button -->
    <div class="text-center">
      <button 
        class="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        @click.stop="$emit('click')"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true,
    validator: (value) => ['admin', 'student'].includes(value)
  },
  features: {
    type: Array,
    required: true
  },
  buttonText: {
    type: String,
    required: true
  },
  lastAccessed: {
    type: String,
    default: null
  }
});

defineEmits(['click']);

// Computed properties for dynamic styling
const iconClasses = computed(() => {
  if (props.icon === 'admin') {
    return 'bg-gradient-to-br from-purple-500 to-indigo-600';
  } else {
    return 'bg-gradient-to-br from-green-500 to-blue-600';
  }
});
</script>

<style scoped>
/* Custom hover effects */
.hover\:shadow-xl:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
