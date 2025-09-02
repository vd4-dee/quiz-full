<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Users</h2>
      <button class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700" @click="$emit('add-user')">
        Add User
      </button>
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white rounded shadow">
        <thead>
          <tr class="text-left border-b border-gray-200">
            <th class="py-2 px-4"><input type="checkbox" :checked="allSelected" @change="$emit('toggle-all')" /></th>
            <th class="py-2 px-4">Name</th>
            <th class="py-2 px-4">Email</th>
            <th class="py-2 px-4">Role</th>
            <th class="py-2 px-4">Status</th>
            <th class="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in pagedUsers" :key="user.id" class="border-b border-gray-100">
            <td class="py-2 px-4"><input type="checkbox" :checked="selectedIds.includes(user.id)" @change="$emit('toggle-select', user.id)" /></td>
            <td class="py-2 px-4">{{ user.name }}</td>
            <td class="py-2 px-4">{{ user.email }}</td>
            <td class="py-2 px-4">{{ user.role }}</td>
            <td class="py-2 px-4">
              <span :class="user.status === 'active' ? 'text-green-600' : 'text-gray-500'">
                {{ user.status }}
              </span>
            </td>
            <td class="py-2 px-4 space-x-2">
              <button class="text-blue-600 hover:underline" @click="$emit('edit-user', user)">Edit</button>
              <button class="text-red-600 hover:underline" @click="$emit('delete-user', user)">Delete</button>
              <button class="text-emerald-600 hover:underline" @click="$emit('view-history', user)">History</button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="6" class="text-center text-gray-400 py-4">No users found.</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="totalPages > 1" class="flex justify-center mt-4 gap-2">
      <button @click="prevPage" :disabled="page === 1" class="px-3 py-1 rounded border" :class="page === 1 ? 'bg-gray-200' : 'bg-white'">Prev</button>
      <span>Page {{ page }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="page === totalPages" class="px-3 py-1 rounded border" :class="page === totalPages ? 'bg-gray-200' : 'bg-white'">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  allSelected: Boolean
});

const page = ref(1);
const pageSize = 50;
const totalPages = computed(() => Math.ceil(props.users.length / pageSize));
const pagedUsers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return props.users.slice(start, start + pageSize);
});
function prevPage() {
  if (page.value > 1) page.value--;
}
function nextPage() {
  if (page.value < totalPages.value) page.value++;
}
watch(() => props.users, () => { page.value = 1; });
</script>
