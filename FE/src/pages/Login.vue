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
        <h2 class="text-3xl font-extrabold text-white font-valorant tracking-wider mb-2">ĐĂNG NHẬP</h2>
        <div class="w-12 h-[3px] bg-[#ff4655] mx-auto mb-4 rounded-full"></div>
        <p class="text-gray-400 text-xs tracking-wider uppercase font-semibold">Truy cập tài khoản giải đấu của bạn</p>
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

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <!-- Username input -->
        <div class="space-y-2 text-left">
          <label for="username" class="block text-[10px] font-bold uppercase tracking-widest text-[#ff4655]">Tên đăng nhập</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
              <i class="fas fa-user text-sm"></i>
            </span>
            <input 
              v-model="username" 
              type="text" 
              id="username" 
              required
              placeholder="Nhập tên đăng nhập của bạn"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-9 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655]/20 transition duration-300"
            />
          </div>
        </div>

        <!-- Password input -->
        <div class="space-y-2 text-left">
          <div class="flex justify-between items-center mb-1">
            <label for="password" class="block text-[10px] font-bold uppercase tracking-widest text-[#ff4655]">Mật khẩu</label>
            <router-link to="/reset-password" class="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition">Quên mật khẩu?</router-link>
          </div>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 pointer-events-none">
              <i class="fas fa-lock text-sm"></i>
            </span>
            <input 
              v-model="password" 
              type="password" 
              id="password" 
              required
              placeholder="Nhập mật khẩu của bạn"
              class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-9 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#ff4655] focus:ring-1 focus:ring-[#ff4655]/20 transition duration-300"
            />
          </div>
        </div>

        <!-- Remember me checkbox -->
        <div class="flex items-center text-left py-1">
          <label class="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-400 hover:text-white transition">
            <input 
              v-model="rememberMe" 
              type="checkbox"
              class="rounded border-white/10 bg-white/5 text-[#ff4655] focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer w-4 h-4"
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full py-3.5 px-6 rounded-xl bg-[#ff4655] hover:bg-[#ff5e6b] text-white font-bold uppercase tracking-widest text-xs transition duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#ff4655]/20 disabled:opacity-50 disabled:cursor-not-allowed font-valorant"
        >
          <i v-if="isLoading" class="fas fa-spinner fa-spin text-sm"></i>
          <span>{{ isLoading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP' }}</span>
        </button>
      </form>

      <!-- Register Switcher -->
      <div class="mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-400 font-medium">
        Bạn chưa có tài khoản? 
        <router-link to="/register" class="text-[#ff4655] hover:text-[#ff5e6b] font-bold transition ml-1 uppercase tracking-wider">Đăng ký ngay</router-link>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  const savedUsername = localStorage.getItem('remembered_username')
  if (savedUsername) {
    username.value = savedUsername
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Có lỗi xảy ra khi đăng nhập.')
    }

    successMessage.value = 'Đăng nhập thành công!'
    
    // Remember login functionality
    if (rememberMe.value) {
      localStorage.setItem('remembered_username', username.value)
    } else {
      localStorage.removeItem('remembered_username')
    }

    // Store user login info
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('user_role', data.user.role)
    
    // Fire auth update event
    window.dispatchEvent(new CustomEvent('auth-state-changed'))
    window.dispatchEvent(new CustomEvent('role-changed', { detail: data.user.role }))

    // Redirect to home page or previous page
    setTimeout(() => {
      router.push('/')
    }, 800)
    
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
