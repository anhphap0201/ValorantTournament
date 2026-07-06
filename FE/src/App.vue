<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

// Role states: 'guest' (Khách) -> 'player' (Tuyển thủ) -> 'admin' (Quản trị viên)
const roles = ['guest', 'player', 'admin']
const currentRole = ref(localStorage.getItem('user_role') || 'guest')

const showToastNotification = ref(false)
const toastText = ref('')
let toastTimeout = null

const showToast = (role) => {
  if (toastTimeout) clearTimeout(toastTimeout)
  
  let roleVietnamese = 'Khách'
  if (role === 'player') roleVietnamese = 'Tuyển thủ'
  if (role === 'admin') roleVietnamese = 'Admin'

  toastText.value = `${roleVietnamese.toUpperCase()}`
  showToastNotification.value = true
  
  toastTimeout = setTimeout(() => {
    showToastNotification.value = false
  }, 1500)
}

const handleKeyPress = (event) => {
  // If user is currently typing in an input, textarea or select, ignore shortcut
  const activeEl = document.activeElement
  if (activeEl && (
    activeEl.tagName === 'INPUT' || 
    activeEl.tagName === 'TEXTAREA' || 
    activeEl.tagName === 'SELECT' || 
    activeEl.isContentEditable
  )) {
    return
  }

  // Pressing 'r' (case insensitive) switches roles
  if (event.key.toLowerCase() === 'r') {
    const currentIndex = roles.indexOf(currentRole.value)
    const nextIndex = (currentIndex + 1) % roles.length
    const nextRole = roles[nextIndex]
    
    currentRole.value = nextRole
    localStorage.setItem('user_role', nextRole)
    
    // Log to console for dev reference
    console.log(`%c[Role Switcher] Switched to: ${nextRole.toUpperCase()}`, 'color: #ff4655; font-weight: bold;')
    
    // Notify other components of the change
    window.dispatchEvent(new CustomEvent('role-changed', { detail: nextRole }))
    
    showToast(nextRole)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-valDark text-white relative">
    <Header />
    <main class="pt-16 flex-grow flex flex-col">
      <router-view />
    </main>
    <Footer />

    <!-- Premium Cyberpunk Toast Notification -->
    <Transition name="fade-toast">
      <div 
        v-if="showToastNotification" 
        class="fixed top-20 right-6 z-50 bg-[#0f1923]/95 border-l-4 border-[#ff4655] backdrop-blur-md px-5 py-3 rounded-r-xl shadow-2xl flex items-center gap-3"
      >
        <div class="w-2 h-2 rounded-full bg-[#ff4655] animate-ping"></div>
        <div class="text-left">
          <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Chuyển vai trò thành công</p>
          <p class="text-sm font-bold text-white uppercase tracking-wider mt-1 font-valorant">{{ toastText }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-toast-enter-active, .fade-toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-toast-enter-from {
  transform: translateX(50px);
  opacity: 0;
}
.fade-toast-leave-to {
  transform: translateX(50px);
  opacity: 0;
}
</style>
