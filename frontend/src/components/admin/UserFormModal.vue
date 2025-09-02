<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
      <h3 class="text-lg font-semibold mb-4">{{ isEdit ? 'Edit User' : 'Add User' }}</h3>
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label class="block mb-1 font-medium">Full Name</label>
          <input v-model="form.name" type="text" class="w-full px-3 py-2 border rounded" required />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Email</label>
          <input v-model="form.email" type="email" class="w-full px-3 py-2 border rounded" required />
          <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
        </div>
        <div class="mb-4" v-if="!isEdit">
          <label class="block mb-1 font-medium">Password</label>
          <input v-model="form.password" type="password" class="w-full px-3 py-2 border rounded" required minlength="6" />
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>
        <div class="mb-4" v-if="!isEdit">
          <label class="block mb-1 font-medium">Confirm Password</label>
          <input v-model="form.passwordConfirm" type="password" class="w-full px-3 py-2 border rounded" required minlength="6" />
          <p v-if="errors.passwordConfirm" class="text-red-500 text-xs mt-1">{{ errors.passwordConfirm }}</p>
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Role</label>
          <select v-model="form.role" class="w-full px-3 py-2 border rounded" required>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Status</label>
          <select v-model="form.status" class="w-full px-3 py-2 border rounded" required>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div v-if="errorMessage" class="text-red-500 text-sm mb-2">{{ errorMessage }}</div>
        <div class="flex justify-end space-x-2">
          <button type="button" @click="$emit('cancel')" class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300">Cancel</button>
          <button type="submit" class="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark">{{ isEdit ? 'Save' : 'Create' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue';
const props = defineProps({
  show: Boolean,
  user: Object,
  isEdit: Boolean,
  errorMessage: String
});
const emit = defineEmits(['submit', 'cancel']);

const form = reactive({
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  role: 'user',
  status: 'active',
});
const errors = reactive({ email: '', password: '', passwordConfirm: '' });

watch(() => props.user, (val) => {
  if (val && props.isEdit) {
    form.name = val.name;
    form.email = val.email;
    form.role = val.role;
    form.status = val.status;
    form.password = '';
    form.passwordConfirm = '';
  } else {
    form.name = '';
    form.email = '';
    form.role = 'user';
    form.status = 'active';
    form.password = '';
    form.passwordConfirm = '';
  }
}, { immediate: true });

function validate() {
  errors.email = '';
  errors.password = '';
  errors.passwordConfirm = '';
  if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
    errors.email = 'Invalid email format.';
  }
  if (!props.isEdit && form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (!props.isEdit && form.password !== form.passwordConfirm) {
    errors.passwordConfirm = 'Passwords do not match.';
  }
  return !errors.email && !errors.password && !errors.passwordConfirm;
}

function submitForm() {
  if (validate()) {
    emit('submit', { ...form });
  }
}
</script>
