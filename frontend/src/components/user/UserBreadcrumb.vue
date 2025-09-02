<template>
  <nav class="flex" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2">
      <li v-for="(crumb, index) in crumbs" :key="crumb.label" class="flex items-center">
        <!-- Separator -->
        <svg
          v-if="index > 0"
          class="h-4 w-4 text-gray-400 mx-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>

        <!-- Breadcrumb Item -->
        <router-link
          v-if="crumb.to"
          :to="crumb.to"
          class="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200 hover:underline"
        >
          {{ crumb.label }}
        </router-link>
        <span
          v-else
          class="text-sm font-medium text-gray-900"
          :aria-current="index === crumbs.length - 1 ? 'page' : undefined"
        >
          {{ crumb.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  crumbs: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition: color 0.15s ease-in-out;
}

/* Hover effects */
.hover\:underline:hover {
  text-decoration: underline;
}
</style>
