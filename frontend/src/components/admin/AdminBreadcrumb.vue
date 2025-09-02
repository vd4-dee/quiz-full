<template>
  <nav class="flex items-center text-sm text-gray-500 dark:text-gray-300" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-3">
      <li v-for="(crumb, idx) in crumbs" :key="idx" class="inline-flex items-center">
        <span v-if="idx !== 0" class="mx-2">/</span>
        <router-link :to="crumb.to" class="hover:underline">{{ crumb.label }}</router-link>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { defineProps } from 'vue';
const props = defineProps({
  crumbs: {
    type: Array,
    required: true,
  },
});
</script>
