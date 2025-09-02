<template>
  <header class="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6 bg-white border-b border-gray-200">
    <div class="flex items-center space-x-3 sm:space-x-4">
      <button @click="$emit('toggleSidebar')" class="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
        <svg class="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width: 1.25rem; height: 1.25rem; min-width: 1.25rem; min-height: 1.25rem;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <slot name="breadcrumb" />
    </div>
    
    <div class="flex items-center space-x-2 sm:space-x-3">
      <button class="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
        <span class="sr-only">Notifications</span>
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width: 1rem; height: 1rem; min-width: 1rem; min-height: 1rem;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <span class="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-red-500"></span>
      </button>
      
      <div class="relative">
        <button class="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <span class="text-xs sm:text-sm font-medium text-gray-700">Admin</span>
          <svg class="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width: 0.75rem; height: 0.75rem; min-width: 0.75rem; min-height: 0.75rem;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>
      
      <button class="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200" @click="$emit('logout')">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width: 1rem; height: 1rem; min-width: 1rem; min-height: 1rem;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1"/>
        </svg>
        <span class="sr-only">Logout</span>
      </button>
    </div>
  </header>
</template>

<script setup>
// No logic needed for static header
</script>

<style scoped>
/* Force icon sizing to prevent scaling issues */
svg {
  width: 1rem !important;
  height: 1rem !important;
  min-width: 1rem !important;
  min-height: 1rem !important;
}

@media (min-width: 640px) {
  svg {
    width: 1.25rem !important;
    height: 1.25rem !important;
    min-width: 1.25rem !important;
    min-height: 1.25rem !important;
  }
}

/* Specific icon sizes */
.w-3.h-3 svg {
  width: 0.75rem !important;
  height: 0.75rem !important;
}

.w-4.h-4 svg {
  width: 1rem !important;
  height: 1rem !important;
}

.w-5.h-5 svg {
  width: 1.25rem !important;
  height: 1.25rem !important;
}

.w-6.h-6 svg {
  width: 1.5rem !important;
  height: 1.5rem !important;
}
</style>
