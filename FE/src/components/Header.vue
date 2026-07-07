<template>
  <nav class="bg-[#0b131a]/95 backdrop-blur-md border-b border-white/10 fixed top-0 left-0 w-full z-[1000] h-16">
    <div class="max-w-[95%] mx-auto h-full flex items-center justify-between px-4">
      
      <router-link to="/" class="flex items-center gap-2 cursor-pointer flex-shrink-0">
        <img src="/assets/logo/DKlogo.png" class="h-8 w-auto" alt="Logo">
        <span class="text-[#ff4655] text-2xl font-bold font-sans tracking-wider">GROUP</span>
      </router-link>

<div class="hidden md:flex items-center space-x-6 h-full">
  <router-link
    v-for="link in navLinks"
    :key="link.path"
    :to="link.path"
    class="text-gray-300 hover:text-[#ff4655] transition h-full flex items-center border-b-2 border-transparent hover:border-[#ff4655]/50 px-1 font-bold text-sm"
    exact-active-class="text-[#ff4655] !border-[#ff4655]"
  >
    {{ link.name }}
  </router-link>
</div>

        <div class="hidden md:block">
          <div class=" flex items-center gap-3">
            <template v-if="isLoggedIn">
              <router-link to="/profile" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium border border-white/10 hover:border-white/20 bg-white/5 transition flex items-center gap-2">
                <img v-if="user?.avatar" :src="user.avatar" class="w-5 h-5 rounded-full object-cover border border-white/10" />
                <i v-else class="fas fa-user text-xs"></i>
                <span>{{ user?.username || '' }}</span>
              </router-link>
              <button @click="logout" class="text-white bg-[#ff4655] hover:bg-[#ff5e6b] px-4 py-2 rounded text-sm font-medium transition shadow-lg shadow-[#ff4655]/30">
                Đăng xuất
              </button>
            </template>
            <template v-else>
              <router-link to="/notifications" class="text-gray-300 hover:text-[#ff4655] p-2 rounded-full hover:bg-white/5 transition relative flex items-center justify-center mr-1" title="Thông báo">
                <i class="fas fa-bell text-sm"></i>
              </router-link>
              <router-link to="/login" class="text-gray-300 hover:text-[#ff4655] px-3 py-2 rounded-md text-sm font-medium transition">Đăng nhập</router-link>
              <router-link to="/register" class="text-white bg-[#ff4655] hover:bg-[#ff5e6b] px-4 py-2 rounded text-sm font-medium transition shadow-lg shadow-[#ff4655]/30">Đăng ký</router-link>
            </template>
          </div>
        </div>

      <div class="md:hidden flex items-center">
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen" 
          class="text-white p-2 z-[9999] relative"
          aria-label="Toggle menu"
        >
          <div class="w-6 h-5 flex flex-col justify-between">
            <span class="block h-0.5 w-full bg-white transition-all" :class="mobileMenuOpen ? 'rotate-45 translate-y-[10px]' : ''"></span>
            <span class="block h-0.5 w-full bg-white transition-all" :class="mobileMenuOpen ? 'opacity-0' : ''"></span>
            <span class="block h-0.5 w-full bg-white transition-all" :class="mobileMenuOpen ? '-rotate-45 -translate-y-[10px]' : ''"></span>
          </div>
        </button>
      </div>

    </div>

<div
  v-show="mobileMenuOpen"
  class="md:hidden absolute top-16 left-0 w-full bg-[#0b131a] border-b border-white/10 shadow-xl p-4 flex flex-col space-y-4"
>
  <router-link
    v-for="link in navLinks"
    :key="link.path"
    :to="link.path"
    @click="mobileMenuOpen = false"
    class="text-gray-300 hover:text-[#ff4655] transition py-1 text-left font-bold"
    exact-active-class="text-[#ff4655] border-l-2 border-[#ff4655] pl-3"
  >
    {{ link.name }}
  </router-link>

  <div class="border-t border-white/10 pt-4 flex flex-col gap-2">
    <template v-if="isLoggedIn">
      <button
        @click="logout"
        class="text-white bg-[#ff4655] w-full py-2 rounded"
      >
        Đăng xuất
      </button>
    </template>

    <template v-else>
      <router-link
        to="/login"
        class="text-white border border-white/20 text-center py-2 rounded"
      >
        Đăng nhập
      </router-link>

      <router-link
        to="/register"
        class="text-white bg-[#ff4655] text-center py-2 rounded"
      >
        Đăng ký
      </router-link>
    </template>
  </div>
</div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const mobileMenuOpen = ref(false);
const isLoggedIn = ref(false);
const user = ref(null);

const checkLoginStatus = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    user.value = JSON.parse(storedUser);
    isLoggedIn.value = true;
  } else {
    user.value = null;
    isLoggedIn.value = false;
  }
};

const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("user_role");
  isLoggedIn.value = false;
  user.value = null;
  
  // Dispatch custom event to notify other components of auth change
  window.dispatchEvent(new CustomEvent("auth-state-changed"));
  // Reset role to guest
  window.dispatchEvent(new CustomEvent("role-changed", { detail: "guest" }));

  mobileMenuOpen.value = false;
  router.push("/login");
};

const navLinks = [
  { name: "Trang chủ", path: "/" },
  { name: "Giải đấu", path: "/tournaments" },
  { name: "Quản trị", path: "/admin" },
];

onMounted(() => {
  checkLoginStatus();
  window.addEventListener("auth-state-changed", checkLoginStatus);
});

onUnmounted(() => {
  window.removeEventListener("auth-state-changed", checkLoginStatus);
});
</script>