<template>
  <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#020617] relative px-4 py-12 overflow-hidden">
    <!-- Premium background glowing orbs -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff4655]/5 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00f599]/5 rounded-full blur-[120px] pointer-events-none"></div>
    
    <!-- Cyberpunk grid background pattern -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25 pointer-events-none"></div>

    <div class="w-full max-w-md glass-card p-8 md:p-10 rounded-3xl relative shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/5 transition-all duration-300 hover:border-[#ff4655]/20 animate-fadeIn">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-extrabold text-white font-valorant tracking-wider mb-2">QUÊN MẬT KHẨU</h2>
        <div class="w-12 h-[3px] bg-[#ff4655] mx-auto mb-4 rounded-full"></div>
        <p class="text-gray-400 text-xs tracking-wider uppercase font-semibold">
          {{ step === 1 ? 'Nhập email tài khoản của bạn' : 'Thiết lập mật khẩu mới' }}
        </p>
      </div>

      <!-- Messages -->
      <Transition name="slide-fade">
        <div v-if="errorMessage" class="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-200 text-xs flex items-center gap-3 animate-fadeIn">
          <i class="fas fa-exclamation-triangle text-[#ff4655] text-sm shrink-0"></i>
          <span class="text-left font-medium">{{ errorMessage }}</span>
        </div>
      </Transition>

      <Transition name="slide-fade">
        <div v-if="successMessage" class="mb-6 p-4 rounded-xl bg-[#00f599]/10 border border-[#00f599]/20 text-[#00f599] text-xs flex items-center gap-3 animate-fadeIn">
          <i class="fas fa-check-circle text-sm shrink-0 animate-pulse"></i>
          <span class="text-left font-medium">{{ successMessage }}</span>
        </div>
      </Transition>

      <!-- Step 1: Input Email -->
      <div v-if="step === 1">
        <form @submit.prevent="handleVerifyEmail" class="space-y-6">
          <div class="space-y-2 text-left">
            <label for="email" class="block text-[10px] font-bold uppercase tracking-widest text-[#ff4655]">Địa chỉ Email</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                <i class="fas fa-envelope text-sm"></i>
              </span>
              <input 
                v-model="email" 
                type="email" 
                id="email" 
                required
                placeholder="Nhập email đã đăng ký..."
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-9 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655]/20 transition duration-300"
              />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full py-3.5 px-6 rounded-xl bg-[#ff4655] hover:bg-[#ff5e6b] text-white font-bold uppercase tracking-widest text-xs transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#ff4655]/20 disabled:opacity-50 disabled:cursor-not-allowed font-valorant"
          >
            <i v-if="isLoading" class="fas fa-spinner fa-spin text-sm"></i>
            <span>{{ isLoading ? 'ĐANG KIỂM TRA...' : 'XÁC NHẬN EMAIL' }}</span>
          </button>
        </form>
      </div>

      <!-- Step 2: Input New Password -->
      <div v-else-if="step === 2">
        <form @submit.prevent="handleResetPassword" class="space-y-5">
          <!-- Hidden/Read-only Email -->
          <div class="space-y-2 text-left">
            <label class="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Email đang đặt lại</label>
            <input 
              :value="email" 
              type="text" 
              disabled 
              class="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2.5 text-gray-500 cursor-not-allowed text-sm"
            />
          </div>

          <!-- New Password input -->
          <div class="space-y-2 text-left">
            <label for="newPassword" class="block text-[10px] font-bold uppercase tracking-widest text-[#ff4655]">Mật khẩu mới</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                <i class="fas fa-lock text-sm"></i>
              </span>
              <input 
                v-model="newPassword" 
                type="password" 
                id="newPassword" 
                required
                placeholder="Nhập mật khẩu mới..."
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655]/20 transition duration-300"
              />
            </div>
          </div>

          <!-- Confirm New Password input -->
          <div class="space-y-2 text-left">
            <label for="confirmNewPassword" class="block text-[10px] font-bold uppercase tracking-widest text-[#ff4655]">Xác nhận mật khẩu mới</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
                <i class="fas fa-shield-alt text-sm"></i>
              </span>
              <input 
                v-model="confirmNewPassword" 
                type="password" 
                id="confirmNewPassword" 
                required
                placeholder="Xác nhận mật khẩu mới..."
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655]/20 transition duration-300"
              />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full py-3.5 px-6 rounded-xl bg-[#ff4655] hover:bg-[#ff5e6b] text-white font-bold uppercase tracking-widest text-xs transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#ff4655]/20 disabled:opacity-50 disabled:cursor-not-allowed font-valorant mt-4"
          >
            <i v-if="isLoading" class="fas fa-spinner fa-spin text-sm"></i>
            <span>{{ isLoading ? 'ĐANG CẬP NHẬT...' : 'ĐẶT LẠI MẬT KHẨU' }}</span>
          </button>
        </form>
      </div>

      <!-- Back to login link -->
      <div class="mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-400 font-medium">
        <router-link to="/login" class="text-gray-400 hover:text-white transition flex items-center justify-center gap-2 uppercase tracking-wider">
          <i class="fas fa-arrow-left text-[10px] text-[#ff4655]"></i> Quay lại Đăng nhập
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.font-valorant {
  font-family: 'Chakra Petch', sans-serif;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
</style>
