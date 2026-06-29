<template>
  <div class="cyber-grid flex-grow flex justify-center pt-12 px-4">
    <div class="w-full max-w-md">

      <router-link to="/" class="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white uppercase mb-2 transition font-bold">
         <i class="fa-solid fa-arrow-left"></i>Quay lại Trang chủ
      </router-link>
      <div class="w-full glass-card rounded-lg border border-white/10 glow-red overflow-hidden relative val-border-corner">
        
        <div class="p-8">

          <!-- Title -->
          <div class="mb-6">
            <h2 class="text-2xl font-bold font-valorant text-white text-center">ĐĂNG NHẬP</h2>
          </div>

          <!-- Error Message Panel -->
          <div v-if="errorMsg" class="bg-rose-950/40 border border-rose-500/30 text-rose-400 p-3 rounded text-xs mb-4 flex items-start ">
            <i class="fa-solid fa-triangle-exclamation mt-0.5"></i>
            <span>{{ errorMsg }}</span>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="Email" class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Email</label>
              <input v-model="Email" type="text" id="Email" required class="block w-full pl-3 pr-3 py-2 bg-white/5 border border-white/10 rounded focus:border-[#ff4655] focus:outline-none text-white text-sm transition">
            </div>

            <div class="mb-10">
              <div class="flex justify-between items-center mb-2">
                <label for="password" class="block text-xs font-bold text-gray-300 uppercase tracking-wider">Mật khẩu</label>
                <a href="#" @click.prevent="openForgotModal" class="text-xs text-[#ff4655] hover:text-[#ff5e6b] hover:underline">Quên mật khẩu?</a>
              </div>
              <input v-model="password" type="password" id="password" required class="block w-full pl-3 pr-3 py-2 bg-white/5 border border-white/10 rounded focus:border-[#ff4655] focus:outline-none text-white text-sm transition">
              <div class="flex items-center mt-4 ">
                <input type="checkbox" id="remember" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500">
                <label for="remember" class="text-xs text-gray-400 hover:text-white">Ghi nhớ đăng nhập</label>
              </div>
            </div>

            <button :disabled="loading" type="submit" class="w-full val-btn-red py-2.5 rounded font-valorant text-sm font-bold tracking-wider uppercase transition shadow-lg shadow-[#ff4655]/30 mt-8 flex justify-center items-center gap-2">
              <template v-if="loading">
                <i class="fa-solid fa-circle-notch animate-spin"></i> <span>Đang xử lý...</span>
              </template>
              <template v-else>
                <span>Đăng nhập</span> <i class="fa-solid fa-right-to-bracket text-xs"></i>
              </template>
            </button>
          </form>

          <!-- Bottom link -->
          <div class="text-center mt-6 pt-6 border-t border-white/5 text-sm">
            <span class="text-gray-400">Chưa có tài khoản?</span>
            <router-link to="/register" class="text-[#ff4655] hover:text-[#ff5e6b] font-semibold ml-1">Đăng ký ngay</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Forgot Password Modal -->
  <div v-if="showForgotModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
    <div class="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-lg overflow-hidden relative val-border-corner glow-red">
      
      <div class="p-6">
        <!-- Close Button -->
        <button @click="showForgotModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-white transition">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
 
        <h3 class="text-lg font-bold font-valorant text-white mb-2">Đặt lại mật khẩu</h3>

        <!-- Message Panel -->
        <div v-if="forgotStatusMsg" :class="forgotStatusType === 'success' ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400' : 'bg-rose-950/40 border border-rose-500/30 text-rose-400'" class="p-3 rounded text-xs mb-4 flex items-start ">
          <i :class="forgotStatusType === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation'" class="mt-0.5"></i>
          <span>{{ forgotStatusMsg }}</span>
        </div>

        <form @submit.prevent="handleForgotPassword" class="space-y-4">
          <div>
            <label for="forgotEmail" class="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Địa chỉ Email</label>
            <input v-model="forgotEmail" type="email" id="forgotEmail" required class="block w-full pl-3 pr-3 py-2 bg-white/5 border border-white/10 rounded focus:border-[#ff4655] focus:outline-none text-white text-sm transition">
          </div>

          <button :disabled="forgotLoading" type="submit" class="w-full bg-[#ff4655] hover:bg-[#ff5e6b] text-white py-2.5 rounded font-valorant text-sm font-bold tracking-wider uppercase transition shadow-lg shadow-[#ff4655]/30 flex justify-center items-center gap-2">
            <template v-if="forgotLoading">
              <i class="fa-solid fa-circle-notch animate-spin"></i> <span>Đang xử lý...</span>
            </template>
            <template v-else>
              <span>Gửi mã đặt lại</span> <i class="fa-solid fa-paper-plane text-xs"></i>
            </template>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import API from '../../assets/js/api.js';
import Auth from '../../assets/js/auth.js';
import Utils from '../../assets/js/utils.js';

const router = useRouter();
const Email = ref('');
const password = ref('');
const loading = ref(false);
const errorMsg = ref('');

// Forgot Password Modal States
const showForgotModal = ref(false);
const forgotEmail = ref('');
const forgotLoading = ref(false);
const forgotStatusMsg = ref('');
const forgotStatusType = ref('success');

onMounted(() => {
  if (Auth.isLoggedIn()) {
    router.push('/');
  }
});

async function handleLogin() {
  errorMsg.value = '';
  loading.value = true;

  try {
    const response = await API.auth.login(Email.value.trim(), password.value);
    Auth.login(response.token, response.user);
    
    Utils.showToast('Đăng nhập thành công!', 'success');
    
    setTimeout(() => {
      if (response.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
    }, 1000);
  } catch (err) {
    console.error(err);
    errorMsg.value = err.message || 'Lỗi đăng nhập. Vui lòng thử lại.';
    loading.value = false;
  }
}

function openForgotModal() {
  forgotEmail.value = '';
  forgotStatusMsg.value = '';
  showForgotModal.value = true;
}

async function handleForgotPassword() {
  forgotStatusMsg.value = '';
  forgotLoading.value = true;

  try {
    await API.auth.forgotPassword(forgotEmail.value.trim());
    forgotStatusType.value = 'success';
    forgotStatusMsg.value = 'Mã xác nhận đã được gửi đến email của bạn. Kiểm tra email của bạn để tiến hành khôi phục.';
    forgotEmail.value = '';
  } catch (err) {
    console.error(err);
    forgotStatusType.value = 'error';
    forgotStatusMsg.value = err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
  } finally {
    forgotLoading.value = false;
  }
}
</script>
