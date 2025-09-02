<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
      <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
      <p class="mb-4">{{ message }}</p>
      <div class="flex justify-end space-x-2">
        <button @click="$emit('cancel')" class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300">Cancel</button>
        <button @click="$emit('confirm')" class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  title: String,
  message: String,
});
</script>
