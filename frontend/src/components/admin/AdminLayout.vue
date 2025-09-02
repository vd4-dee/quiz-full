<template>
  <div class="flex min-h-screen bg-gray-50 admin-container">
    <!-- Desktop Sidebar -->
    <AdminSidebar v-if="sidebarOpen" class="hidden lg:block w-64 flex-shrink-0" />
    
    <!-- Mobile Sidebar Overlay -->
    <div v-if="mobileSidebar" class="fixed inset-0 z-40 lg:hidden">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75" @click="mobileSidebar = false"></div>
      <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <AdminSidebar @click.self="mobileSidebar = false" />
      </div>
    </div>
    
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <AdminHeader @toggleSidebar="toggleSidebar" @logout="onLogout">
        <template #breadcrumb>
          <AdminBreadcrumb :crumbs="breadcrumbs" />
        </template>
      </AdminHeader>
      
      <main class="flex-1 overflow-y-auto overflow-x-hidden">
        <div class="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <slot />
        </div>
      </main>
      
      <ToastNotification v-if="toast.message" :message="toast.message" :type="toast.type" />
      <ConfirmDialog v-if="confirm.show" :show="confirm.show" :title="confirm.title" :message="confirm.message" @confirm="confirm.onConfirm" @cancel="confirm.onCancel" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AdminSidebar from './AdminSidebar.vue';
import AdminHeader from './AdminHeader.vue';
import AdminBreadcrumb from './AdminBreadcrumb.vue';
import ToastNotification from './ToastNotification.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const sidebarOpen = ref(true);
const mobileSidebar = ref(false);
const breadcrumbs = ref([
  { label: 'Dashboard', to: '/admin/dashboard' },
]);
const toast = ref({ message: '', type: 'success' });
const confirm = ref({ show: false, title: '', message: '', onConfirm: null, onCancel: null });

function toggleSidebar() {
  mobileSidebar.value = !mobileSidebar.value;
}

function onLogout() {
  // Emit logout event or call store action
}
</script>

<style scoped>
</style>
