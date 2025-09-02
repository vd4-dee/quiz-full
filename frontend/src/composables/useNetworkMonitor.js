// composables/useNetworkMonitor.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useNetworkMonitor() {
  const isOnline = ref(navigator.onLine)
  const lastPing = ref(null)
  const pingInterval = ref(null)

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:8090/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      })
      lastPing.value = Date.now()
      return response.ok
    } catch {
      return false
    }
  }

  const startMonitoring = () => {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      isOnline.value = true
      console.log('🌐 Network: Back online')
    })
    
    window.addEventListener('offline', () => {
      isOnline.value = false
      console.log('🌐 Network: Gone offline')
    })
    
    // Check connection every 30 seconds
    pingInterval.value = setInterval(async () => {
      const connected = await checkConnection()
      if (!connected && isOnline.value) {
        console.warn('⚠️ Network: Connection check failed')
      }
    }, 30000)

    // Initial check
    checkConnection()
  }

  const stopMonitoring = () => {
    if (pingInterval.value) {
      clearInterval(pingInterval.value)
      pingInterval.value = null
    }
    
    window.removeEventListener('online', () => isOnline.value = true)
    window.removeEventListener('offline', () => isOnline.value = false)
  }

  onMounted(() => {
    startMonitoring()
  })

  onUnmounted(() => {
    stopMonitoring()
  })

  return { 
    isOnline, 
    lastPing, 
    checkConnection, 
    startMonitoring, 
    stopMonitoring 
  }
}
