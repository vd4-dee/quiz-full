<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AdminLayout from '../../components/admin/AdminLayout.vue'
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()

// Reactive data
const loading = ref(false)
const users = ref([])
const selectedUsers = ref([])
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const sortField = ref('name')
const sortDirection = ref('asc')
const openMenuUserId = ref(null)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const creatingUser = ref(false)

// Form data
const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'user',
  active: true
})

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (filterRole.value) {
    filtered = filtered.filter(user => user.role === filterRole.value)
  }

  // Status filter
  if (filterStatus.value) {
    filtered = filtered.filter(user => user.status === filterStatus.value)
  }

  // Sorting
  filtered.sort((a, b) => {
    const aVal = a[sortField.value]
    const bVal = b[sortField.value]
    const direction = sortDirection.value === 'asc' ? 1 : -1
    
    if (aVal < bVal) return -1 * direction
    if (aVal > bVal) return 1 * direction
    return 0
  })

  return filtered
})

const totalUsers = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredUsers.value.slice(start, end)
})

const allSelected = computed(() => 
  paginatedUsers.value.length > 0 && 
  paginatedUsers.value.every(user => selectedUsers.value.includes(user.id))
)

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Methods
const loadUsers = async () => {
  loading.value = true
  try {
    // Load users from admin store
    await adminStore.loadUsers()
    users.value = adminStore.users || []
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  creatingUser.value = true
  try {
    const userData = {
      ...newUser.value,
      passwordConfirm: newUser.value.password,
      status: newUser.value.active ? 'active' : 'inactive'
    }
    
    const result = await adminStore.createUser(userData)
    if (result && result.success) {
      showCreateModal.value = false
      resetNewUserForm()
      await loadUsers()
    }
  } catch (error) {
    console.error('Failed to create user:', error)
  } finally {
    creatingUser.value = false
  }
}

const resetNewUserForm = () => {
  newUser.value = {
    name: '',
    email: '',
    password: '',
    role: 'user',
    active: true
  }
}

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  newUser.value.password = password
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedUsers.value = selectedUsers.value.filter(id => 
      !paginatedUsers.value.find(user => user.id === id)
    )
  } else {
    paginatedUsers.value.forEach(user => {
      if (!selectedUsers.value.includes(user.id)) {
        selectedUsers.value.push(user.id)
      }
    })
  }
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const toggleUserMenu = (userId) => {
  openMenuUserId.value = openMenuUserId.value === userId ? null : userId
}

const editUser = (user) => {
  // TODO: Implement edit functionality
  console.log('Edit user:', user)
  openMenuUserId.value = null
}

const resetPassword = async (user) => {
  try {
    const result = await adminStore.resetUserPassword(user.id, 'newpassword123')
    if (result && result.success) {
      console.log('Password reset successful')
    }
  } catch (error) {
    console.error('Failed to reset password:', error)
  }
  openMenuUserId.value = null
}

const toggleUserStatus = async (user) => {
  try {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    const result = await adminStore.updateUser(user.id, { status: newStatus })
    if (result && result.success) {
      user.status = newStatus
    }
  } catch (error) {
    console.error('Failed to toggle status:', error)
  }
  openMenuUserId.value = null
}

const deleteUser = async (user) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    try {
      const result = await adminStore.deleteUser(user.id)
      if (result && result.success) {
        await loadUsers()
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }
  openMenuUserId.value = null
}

// Bulk operations
const bulkSetAdmin = async () => {
  for (const userId of selectedUsers.value) {
    await adminStore.updateUser(userId, { role: 'admin' })
  }
  selectedUsers.value = []
  await loadUsers()
}

const bulkSetUser = async () => {
  for (const userId of selectedUsers.value) {
    await adminStore.updateUser(userId, { role: 'user' })
  }
  selectedUsers.value = []
  await loadUsers()
}

const bulkResetPassword = async () => {
  if (confirm(`Reset password for ${selectedUsers.value.length} users?`)) {
    for (const userId of selectedUsers.value) {
      await adminStore.resetUserPassword(userId, 'newpassword123')
    }
    selectedUsers.value = []
  }
}

const bulkDelete = async () => {
  if (confirm(`Delete ${selectedUsers.value.length} selected users?`)) {
    for (const userId of selectedUsers.value) {
      await adminStore.deleteUser(userId)
    }
    selectedUsers.value = []
    await loadUsers()
  }
}

// Utility methods
const getUserInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getRoleBadgeClass = (role) => {
  return role === 'admin' 
    ? 'bg-purple-100 text-purple-800' 
    : 'bg-blue-100 text-blue-800'
}

const getStatusBadgeClass = (status) => {
  return status === 'active' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800'
}

const formatDate = (date) => {
  if (!date) return 'Never'
  return new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(new Date(date))
}

// Watchers
watch(searchQuery, () => {
  currentPage.value = 1
})

watch([filterRole, filterStatus], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
/* Custom focus styles for better accessibility */
input:focus, select:focus {
  outline: none;
}

/* Smooth transitions for form elements */
input, select, button {
  transition: all 0.2s ease-in-out;
}

/* Custom checkbox styling */
input[type="checkbox"] {
  accent-color: #2563eb;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-lg {
    max-width: 100%;
  }
  
  .p-6 {
    padding: 1rem;
  }
}
</style>