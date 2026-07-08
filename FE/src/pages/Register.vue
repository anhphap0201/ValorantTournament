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
        <h2 class="text-3xl font-extrabold text-white font-valorant tracking-wider mb-2">ĐĂNG KÝ</h2>
        <div class="w-12 h-1 bg-[#ff4655] mx-auto mb-4"></div>
        <p class="text-gray-400 text-sm font-sans">Tạo tài khoản thi đấu của riêng bạn</p>
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

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="space-y-5">
        <!-- Username input -->
        <div class="space-y-1">
          <label for="username" class="block text-xs font-bold uppercase tracking-wider text-gray-300">Tên đăng nhập</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <i class="fas fa-user"></i>
            </span>
            <input 
              v-model="username" 
              type="text" 
              id="username" 
              required
              placeholder="Nhập tên đăng nhập (ví dụ: TenCuaBan)"
              class="w-full bg-[#0a121c] border border-white/10 rounded px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655] transition"
            />
          </div>
        </div>

        <!-- Email input -->
        <div class="space-y-1">
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
              placeholder="Nhập email của bạn..."
              class="w-full bg-[#0a121c] border border-white/10 rounded px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655] transition"
            />
          </div>
        </div>

        <!-- Password input -->
        <div class="space-y-1">
          <label for="password" class="block text-xs font-bold uppercase tracking-wider text-gray-300">Mật khẩu</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <i class="fas fa-lock"></i>
            </span>
            <input 
              v-model="password" 
              type="password" 
              id="password" 
              required
              placeholder="Nhập mật khẩu..."
              class="w-full bg-[#0a121c] border border-white/10 rounded px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655] transition"
            />
          </div>
        </div>

        <!-- Confirm Password input -->
        <div class="space-y-1">
          <label for="confirmPassword" class="block text-xs font-bold uppercase tracking-wider text-gray-300">Xác nhận mật khẩu</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <i class="fas fa-shield-alt"></i>
            </span>
            <input 
              v-model="confirmPassword" 
              type="password" 
              id="confirmPassword" 
              required
              placeholder="Xác nhận lại mật khẩu..."
              class="w-full bg-[#0a121c] border border-white/10 rounded px-4 py-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655] transition"
            />
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full val-btn-red py-3 px-4 font-bold rounded uppercase tracking-wider text-sm cursor-pointer shadow-lg shadow-[#ff4655]/20 flex justify-center items-center gap-2 mt-4"
        >
          <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isLoading ? 'ĐANG TẠO TÀI KHOẢN...' : 'ĐĂNG KÝ' }}</span>
        </button>
      </form>

      <!-- Login Switcher -->
      <div class="mt-8 pt-6 border-t border-white/5 text-center text-sm text-gray-400">
        Bạn đã có tài khoản? 
        <router-link to="/login" class="text-[#ff4655] font-bold hover:underline transition ml-1">Đăng nhập</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Có lỗi xảy ra khi đăng ký.')
    }

    successMessage.value = 'Đăng ký tài khoản thành công! Đang chuyển hướng...'
    
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
