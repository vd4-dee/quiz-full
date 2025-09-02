<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Interface Preferences</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Remember Choice Toggle -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-gray-900">Remember my choice</h4>
          <p class="text-sm text-gray-500">Automatically use your last selected interface</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            :checked="rememberChoice"
            @change="$emit('update:rememberChoice', $event.target.checked)"
            class="sr-only peer"
          >
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <!-- Quick Switch Toggle -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-gray-900">Quick switch</h4>
          <p class="text-sm text-gray-500">Show interface switcher in header</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            :checked="quickSwitch"
            @change="$emit('update:quickSwitch', $event.target.checked)"
            class="sr-only peer"
          >
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>

    <!-- Interface Usage Statistics -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <h4 class="font-medium text-gray-900 mb-4">Interface Usage Statistics</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Admin Interface Stats -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Admin Interface</span>
            <span class="text-sm text-gray-500">{{ interfaceStats.admin.usage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: interfaceStats.admin.usage + '%' }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ interfaceStats.admin.lastWeek }} sessions last week</p>
        </div>

        <!-- User Interface Stats -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Student Interface</span>
            <span class="text-sm text-gray-500">{{ interfaceStats.user.usage }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: interfaceStats.user.usage + '%' }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ interfaceStats.user.lastWeek }} sessions last week</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rememberChoice: {
    type: Boolean,
    default: true
  },
  quickSwitch: {
    type: Boolean,
    default: false
  },
  interfaceStats: {
    type: Object,
    required: true,
    default: () => ({
      admin: { usage: 0, lastWeek: 0 },
      user: { usage: 0, lastWeek: 0 }
    })
  }
});

defineEmits(['update:rememberChoice', 'update:quickSwitch']);
</script>

<style scoped>
/* Custom toggle switch styling */
.peer:checked ~ div {
  background: linear-gradient(to right, #3b82f6, #1d4ed8);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
