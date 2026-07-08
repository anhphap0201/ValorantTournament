<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-val-dark relative px-4 py-12 overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-1/4 left-1/10 w-96 h-96 bg-[#ff4655]/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/10 w-96 h-96 bg-[#00f599]/5 rounded-full blur-3xl pointer-events-none"></div>
    
    <!-- Cyberpunk Decorative Grids -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

    <div class="w-full max-w-md glass-card p-8 rounded-2xl relative shadow-2xl border border-white/10 max-w-md transition-all duration-300 hover:border-[#ff4655]/30">
      
      <!-- Valorant Crosshair details on corners -->
      <div class="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#ff4655]"></div>
      <div class="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#ff4655]"></div>
      <div class="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#ff4655]"></div>
      <div class="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#ff4655]"></div>
      
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-extrabold text-white font-valorant tracking-wider mb-2">QUÊN MẬT KHẨU</h2>
        <div class="w-12 h-1 bg-[#ff4655] mx-auto mb-4"></div>
        <p class="text-gray-400 text-sm font-sans">
          {{ step === 1 ? 'Nhập email tài khoản của bạn' : 'Thiết lập mật khẩu mới' }}
        </p>
      </div>

      <!-- Error / Success Messages -->
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

      <!-- Step 1: Input Email -->
      <div v-if="step === 1">
        <form @submit.prevent="handleVerifyEmail" class="space-y-6">
          <div class="space-y-2">
            <label for="email" class="block text-xs font-bold uppercase tracking-wider text-gray-300">Địa chỉ Email</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <i class="fas fa-envelope"></i>
              </span>
              <input 
                v-model="email" 
                type="email" 
                id="email" 
                required
                placeholder="Nhập email đã đăng ký..."
                class="w-full bg-[#0a121c] border border-white/10 rounded px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655] transition"
              />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full val-btn-red py-3 px-4 font-bold rounded uppercase tracking-wider text-sm cursor-pointer shadow-lg shadow-[#ff4655]/20 flex justify-center items-center gap-2"
          >
            <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isLoading ? 'ĐANG KIỂM TRA...' : 'XÁC NHẬN EMAIL' }}</span>
          </button>
        </form>
      </div>

      <!-- Step 2: Input New Password -->
      <div v-else-if="step === 2">
        <form @submit.prevent="handleResetPassword" class="space-y-5">
          <!-- Hidden/Read-only Email -->
          <div class="space-y-1">
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-400">Email đang đặt lại</label>
            <input 
              :value="email" 
              type="text" 
              disabled 
              class="w-full bg-white/5 border border-white/5 rounded px-4 py-2.5 text-gray-400 cursor-not-allowed"
            />
          </div>

          <!-- New Password input -->
          <div class="space-y-1">
            <label for="newPassword" class="block text-xs font-bold uppercase tracking-wider text-gray-300">Mật khẩu mới</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <i class="fas fa-lock"></i>
              </span>
              <input 
                v-model="newPassword" 
                type="password" 
                id="newPassword" 
                required
                placeholder="Nhập mật khẩu mới..."
                class="w-full bg-[#0a121c] border border-white/10 rounded px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655] transition"
              />
            </div>
          </div>

          <!-- Confirm New Password input -->
          <div class="space-y-1">
            <label for="confirmNewPassword" class="block text-xs font-bold uppercase tracking-wider text-gray-300">Xác nhận mật khẩu mới</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <i class="fas fa-shield-alt"></i>
              </span>
              <input 
                v-model="confirmNewPassword" 
                type="password" 
                id="confirmNewPassword" 
                required
                placeholder="Xác nhận mật khẩu mới..."
                class="w-full bg-[#0a121c] border border-white/10 rounded px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655] transition"
              />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full val-btn-red py-3 px-4 font-bold rounded uppercase tracking-wider text-sm cursor-pointer shadow-lg shadow-[#ff4655]/20 flex justify-center items-center gap-2 mt-4"
          >
            <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isLoading ? 'ĐANG CẬP NHẬT...' : 'ĐẶT LẠI MẬT KHẨU' }}</span>
          </button>
        </form>
      </div>

      <!-- Back to login link -->
      <div class="mt-8 pt-6 border-t border-white/5 text-center text-sm text-gray-400">
        <router-link to="/login" class="text-gray-300 hover:text-[#ff4655] transition flex items-center justify-center gap-2">
          <i class="fas fa-arrow-left text-xs"></i> Quay lại Đăng nhập
        </router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const step = ref(1)
const email = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleVerifyEmail = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/auth/reset-password/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Email không tồn tại trong hệ thống.')
    }

    successMessage.value = 'Email hợp lệ! Vui lòng nhập mật khẩu mới.'
    
    // Switch to step 2 after a brief moment
    setTimeout(() => {
      successMessage.value = ''
      step.value = 2
    }, 1000)

  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

const handleResetPassword = async () => {
  if (newPassword.value !== confirmNewPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/auth/reset-password/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        newPassword: newPassword.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Đặt lại mật khẩu thất bại.')
    }

    successMessage.value = 'Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...'
    
    setTimeout(() => {
      router.push('/login')
    }, 1500)

  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}
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
