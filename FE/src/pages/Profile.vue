<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-val-dark relative px-4 py-12 overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-1/4 left-1/10 w-96 h-96 bg-[#ff4655]/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#00f599]/5 rounded-full blur-3xl pointer-events-none"></div>
    
    <!-- Cyberpunk Decorative Grids -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

    <div class="w-full max-w-lg glass-card p-8 rounded-2xl relative shadow-2xl border border-white/10 transition-all duration-300 hover:border-[#ff4655]/30">
      
      <!-- Valorant Crosshair details on corners -->
      <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#ff4655]"></div>
      <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#ff4655]"></div>
      <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#ff4655]"></div>
      <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#ff4655]"></div>
      
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-extrabold text-white font-valorant tracking-wider mb-2">HỒ SƠ CÁ NHÂN</h2>
        <div class="w-12 h-1 bg-[#ff4655] mx-auto mb-4"></div>
        <p class="text-gray-400 text-sm">Xem và cập nhật thông tin tài khoản của bạn</p>
      </div>

      <!-- Alert Messages -->
      <Transition name="slide-fade">
        <div v-if="errorMessage" class="mb-6 p-4 rounded bg-red-950/50 border border-red-500/50 text-red-200 text-sm flex items-center gap-2">
          <i class="fas fa-exclamation-triangle text-red-500"></i>
          <span>{{ errorMessage }}</span>
        </div>
      </Transition>

      <Transition name="slide-fade">
        <div v-if="successMessage" class="mb-6 p-4 rounded bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-sm flex items-center gap-2">
          <i class="fas fa-check-circle text-emerald-500"></i>
          <span>{{ successMessage }}</span>
        </div>
      </Transition>

      <div v-if="user" class="space-y-6">
        <!-- Field: Username -->
        <div class="p-4 rounded bg-white/5 border border-white/5 relative group transition hover:bg-white/10">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <span class="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Tên đăng nhập</span>
              <div v-if="!editStates.username" class="text-white font-bold text-lg">
                {{ user.username }}
              </div>
              <div v-else class="mt-2">
                <input 
                  v-model="formData.username" 
                  type="text" 
                  class="bg-[#0a121c] border border-white/20 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#ff4655] text-sm w-72" 
                  placeholder="Nhập tên đăng nhập mới..."
                />
              </div>
            </div>
            
            <div class="flex gap-2">
              <button 
                v-if="!editStates.username"
                @click="startEdit('username')"
                class="text-xs bg-[#ff4655]/10 hover:bg-[#ff4655] border border-[#ff4655]/30 hover:border-transparent text-white px-3 py-1.5 rounded transition cursor-pointer font-bold uppercase tracking-wider"
              >
                Sửa
              </button>
              <template v-else>
                <button 
                  @click="saveField('username')"
                  :disabled="isSubmitting"
                  class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition cursor-pointer font-bold"
                >
                  Lưu
                </button>
                <button 
                  @click="cancelEdit('username')"
                  class="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition cursor-pointer font-bold"
                >
                  Hủy
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Field: Email -->
        <div class="p-4 rounded bg-white/5 border border-white/5 relative group transition hover:bg-white/10">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <span class="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Địa chỉ Email</span>
              <div v-if="!editStates.email" class="text-white font-medium text-lg">
                {{ user.email }}
              </div>
              <div v-else class="mt-2">
                <input 
                  v-model="formData.email" 
                  type="email" 
                  class="bg-[#0a121c] border border-white/20 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#ff4655] text-sm w-72" 
                  placeholder="Nhập email mới..."
                />
              </div>
            </div>
            
            <div class="flex gap-2">
              <button 
                v-if="!editStates.email"
                @click="startEdit('email')"
                class="text-xs bg-[#ff4655]/10 hover:bg-[#ff4655] border border-[#ff4655]/30 hover:border-transparent text-white px-3 py-1.5 rounded transition cursor-pointer font-bold uppercase tracking-wider"
              >
                Sửa
              </button>
              <template v-else>
                <button 
                  @click="saveField('email')"
                  :disabled="isSubmitting"
                  class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition cursor-pointer font-bold"
                >
                  Lưu
                </button>
                <button 
                  @click="cancelEdit('email')"
                  class="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition cursor-pointer font-bold"
                >
                  Hủy
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Field: Password -->
        <div class="p-4 rounded bg-white/5 border border-white/5 relative group transition hover:bg-white/10">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <span class="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Mật khẩu</span>
              <div v-if="!editStates.password" class="text-white font-medium text-lg tracking-widest">
                ●●●●●●●●
              </div>
              <div v-else class="mt-2 space-y-3">
                <div>
                  <label class="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Mật khẩu mới</label>
                  <input 
                    v-model="formData.password" 
                    type="password" 
                    class="bg-[#0a121c] border border-white/20 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#ff4655] text-sm w-72" 
                    placeholder="Nhập mật khẩu mới..."
                  />
                </div>
                <div>
                  <label class="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Xác nhận mật khẩu mới</label>
                  <input 
                    v-model="formData.confirmPassword" 
                    type="password" 
                    class="bg-[#0a121c] border border-white/20 rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#ff4655] text-sm w-72" 
                    placeholder="Xác nhận mật khẩu mới..."
                  />
                </div>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button 
                v-if="!editStates.password"
                @click="startEdit('password')"
                class="text-xs bg-[#ff4655]/10 hover:bg-[#ff4655] border border-[#ff4655]/30 hover:border-transparent text-white px-3 py-1.5 rounded transition cursor-pointer font-bold uppercase tracking-wider"
              >
                Đổi mật khẩu
              </button>
              <template v-else>
                <button 
                  @click="saveField('password')"
                  :disabled="isSubmitting"
                  class="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition cursor-pointer font-bold"
                >
                  Lưu
                </button>
                <button 
                  @click="cancelEdit('password')"
                  class="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition cursor-pointer font-bold"
                >
                  Hủy
                </button>
              </template>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const editStates = ref({
  username: false,
  email: false,
  password: false
})

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const fetchUserProfile = async () => {
  const storedUser = localStorage.getItem('user')
  if (!storedUser) {
    router.push('/login')
    return
  }

  const parsedUser = JSON.parse(storedUser)
  
  try {
    const response = await fetch(`http://localhost:3000/api/auth/profile/${parsedUser.id}`)
    if (!response.ok) {
      throw new Error('Không thể tải thông tin hồ sơ.')
    }
    const data = await response.json()
    user.value = data
    
    // Sync formData
    formData.value.username = data.username
    formData.value.email = data.email
  } catch (err) {
    errorMessage.value = err.message
  }
}

const startEdit = (field) => {
  editStates.value[field] = true
  if (field === 'password') {
    formData.value.password = ''
    formData.value.confirmPassword = ''
  }
}

const cancelEdit = (field) => {
  editStates.value[field] = false
  errorMessage.value = ''
  
  // Revert data
  if (field === 'username') formData.value.username = user.value.username
  if (field === 'email') formData.value.email = user.value.email
}

const saveField = async (field) => {
  errorMessage.value = ''
  successMessage.value = ''

  // Local validation
  if (field === 'username' && !formData.value.username.trim()) {
    errorMessage.value = 'Tên đăng nhập không được để trống.'
    return
  }
  if (field === 'email' && !formData.value.email.trim()) {
    errorMessage.value = 'Email không được để trống.'
    return
  }
  if (field === 'password') {
    if (!formData.value.password) {
      errorMessage.value = 'Mật khẩu mới không được để trống.'
      return
    }
    if (formData.value.password !== formData.value.confirmPassword) {
      errorMessage.value = 'Mật khẩu xác nhận không khớp.'
      return
    }
  }

  isSubmitting.value = true
  
  try {
    const payload = {
      username: formData.value.username,
      email: formData.value.email
    }
    
    if (field === 'password') {
      payload.password = formData.value.password
    }

    const response = await fetch(`http://localhost:3000/api/auth/profile/${user.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Cập nhật thông tin thất bại.')
    }

    successMessage.value = data.message || 'Cập nhật hồ sơ thành công!'
    user.value = data.user
    
    // Update local storage
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('user_role', data.user.role)
    
    // Dispatch auth state change
    window.dispatchEvent(new CustomEvent('auth-state-changed'))

    // Turn off edit state
    editStates.value[field] = false
    
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<style scoped>
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
