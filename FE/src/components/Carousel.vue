<template>
  <div class="relative w-full overflow-hidden py-4">
    <div class="relative w-full h-[400px] overflow-visible">
      <div 
        class="flex w-full h-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        :style="trackStyle"
      >
        <div 
          v-for="(banner, index) in banners" 
          :key="banner.id"
          class="w-[78%] mr-[1.5%] h-full flex-shrink-0 transition-all duration-700"
          :class="activeIndex === index ? 'opacity-100 scale-100' : 'opacity-25 scale-95'"
        >
          <component :is="banner.component" />
        </div>
      </div>
    </div>

    <div class="flex justify-center items-center gap-2 mt-4">
      <button 
        v-for="(banner, index) in banners" 
        :key="banner.id"
        @click="selectBanner(index)"
        class="h-2.5 rounded-full transition-all duration-300 cursor-pointer"
        :class="activeIndex === index ? 'bg-[#ff4655] w-6' : 'bg-white/20 w-2.5'"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import RegisterBanner from "../components/banner/Register.vue";
import DiscordBanner from "../components/banner/Discord.vue";

// Khai báo trực tiếp
const banners = [
  { id: "register", component: RegisterBanner },
  { id: "discord", component: DiscordBanner },
];

// Tạo mảng hiển thị luôn từ banners
const displayBanners = [
  banners[banners.length - 1],
  ...banners,
  banners[0]
];

const activeIndex = ref(0);
let autoplayInterval = null;

const trackStyle = computed(() => {
  // offset tính theo % vị trí banner hiện tại
  const offset = activeIndex.value * 79.5;
  // 11% là khoảng bù để đưa banner chính vào giữa
  return {
    transform: `translateX(calc(-${offset}% + 11%))`
  };
});

function prevSlide() {
  if (activeIndex.value <= 0) {
    activeIndex.value = banners.value.length - 1;
  } else {
    activeIndex.value--;
  }
}
function selectBanner(index) {
  activeIndex.value = index;
  resetAutoplay();
}

function startAutoplay() {
  // Chạy ngược: 10s một lần
  autoplayInterval = setInterval(prevSlide, 10000);
}

function resetAutoplay() {
  clearInterval(autoplayInterval);
  startAutoplay();
}

onMounted(() => startAutoplay());
onUnmounted(() => clearInterval(autoplayInterval));
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .35s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>