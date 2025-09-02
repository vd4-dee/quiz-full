<template>
  <div class="flex items-center gap-2 mb-2">
    <input type="checkbox" :checked="allSelected" @change="$emit('toggle-all')" />
    <button class="px-3 py-1 rounded border bg-red-500 text-white" @click="$emit('bulk-delete')" :disabled="!hasSelection">Delete Selected</button>
    <button class="px-3 py-1 rounded border bg-blue-500 text-white" @click="$emit('bulk-role', 'admin')" :disabled="!hasSelection">Set Admin</button>
    <button class="px-3 py-1 rounded border bg-gray-500 text-white" @click="$emit('bulk-role', 'user')" :disabled="!hasSelection">Set User</button>
    <button class="px-3 py-1 rounded border bg-yellow-500 text-white" @click="$emit('bulk-reset')" :disabled="!hasSelection">Reset Password</button>
    <button class="px-3 py-1 rounded border bg-green-500 text-white" @click="$emit('export-csv')">Export CSV</button>
    <input type="file" accept=".csv" @change="$emit('import-csv', $event)" class="ml-2" />
  </div>
</template>

<script setup>
const props = defineProps({
  allSelected: Boolean,
  hasSelection: Boolean
});
const emit = defineEmits([
  'toggle-all',
  'bulk-delete',
  'bulk-role',
  'bulk-reset',
  'export-csv',
  'import-csv'
]);
</script>
