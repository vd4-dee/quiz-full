<template>
  <transition name="fade">
    <div v-if="visible" :class="['fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg', typeClass]">
      <span>{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
const props = defineProps({
  message: String,
  type: {
    type: String,
    default: 'success',
  },
  duration: {
    type: Number,
    default: 3000,
  },
});
const visible = ref(false);
const typeClass = computed(() => {
  switch (props.type) {
    case 'error': return 'bg-red-600 text-white';
    case 'warning': return 'bg-yellow-500 text-black';
    case 'info': return 'bg-blue-500 text-white';
    default: return 'bg-green-600 text-white';
  }
});
watch(() => props.message, (val) => {
  if (val) {
    visible.value = true;
    setTimeout(() => (visible.value = false), props.duration);
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
